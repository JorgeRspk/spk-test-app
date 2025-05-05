import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Organization, Device, Sensor, getOrganization, getOrganizationDevices, getDeviceSensors } from '../services/organization';

interface DiagramaProps {
    selectedSensor?: string;
    showExample?: boolean;
}

interface Node extends d3.SimulationNodeDatum {
    id: number;
    name: string;
    type: string;
    level: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: number;
    target: number;
}

const Diagrama: React.FC<DiagramaProps> = (props) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<{
        nodes: Node[];
        links: Link[];
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar organización
            const org = await getOrganization('org-001');
            const nodes: Node[] = [
                { id: 1, name: org.nombre, type: "organization", level: 1 }
            ];
            const links: Link[] = [];
            let nextId = 2;

            // Cargar dispositivos
            const devices = await getOrganizationDevices('org-001');
            for (const device of devices) {
                const deviceId = nextId++;
                nodes.push({
                    id: deviceId,
                    name: device.nombre,
                    type: "device",
                    level: 2
                });
                links.push({
                    source: 1,
                    target: deviceId
                });

                // Cargar sensores para cada dispositivo
                const sensors = await getDeviceSensors(device.id);
                const nodesByNodo: { [key: string]: number } = {};

                for (const sensor of sensors) {
                    let nodoId: number;
                    
                    // Crear nodo si no existe
                    if (!nodesByNodo[sensor.nodo]) {
                        nodoId = nextId++;
                        nodesByNodo[sensor.nodo] = nodoId;
                        nodes.push({
                            id: nodoId,
                            name: sensor.nodo,
                            type: "node",
                            level: 3
                        });
                        links.push({
                            source: deviceId,
                            target: nodoId
                        });
                    } else {
                        nodoId = nodesByNodo[sensor.nodo];
                    }

                    // Agregar sensor
                    const sensorId = nextId++;
                    nodes.push({
                        id: sensorId,
                        name: sensor.nombre,
                        type: "sensor",
                        level: 4
                    });
                    links.push({
                        source: nodoId,
                        target: sensorId
                    });
                }
            }

            setGraphData({ nodes, links });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (svgRef.current && graphData) {
            createDiagram(svgRef.current, graphData);
        }
    }, [graphData, props.selectedSensor]);

    // Función para crear el diagrama
    const createDiagram = (svg: SVGSVGElement, data: { nodes: Node[], links: Link[] }) => {
        // Limpiar el SVG existente
        d3.select(svg).selectAll("*").remove();

        // Configuración del SVG
        const width = 1000;
        const height = 600;
        const svgSelection = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        // Crear el simulador de fuerza
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links)
                .id((d: any) => d.id)
                .distance(100))
            .force("charge", d3.forceManyBody().strength(-800))
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY((d: any) => {
                return 100 + (d.level - 1) * 150;
            }));

        // Crear los enlaces
        const link = svgSelection.append("g")
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2);

        // Crear los nodos
        const node = svgSelection.append("g")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(d3.drag<any, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Agregar círculos a los nodos
        node.append("circle")
            .attr("r", (d: any) => {
                if (props.selectedSensor && d.type === "sensor" && d.name === props.selectedSensor) {
                    return 25;
                }
                switch (d.type) {
                    case "organization": return 30;
                    case "device": return 25;
                    case "node": return 20;
                    case "sensor": return 15;
                    default: return 10;
                }
            })
            .attr("fill", (d: any) => {
                if (props.selectedSensor && d.type === "sensor" && d.name === props.selectedSensor) {
                    return "#ff0000";
                }
                switch (d.type) {
                    case "organization": return "#4e79a7";
                    case "device": return "#f28e2c";
                    case "node": return "#e15759";
                    case "sensor": return "#76b7b2";
                    default: return "#999";
                }
            })
            .attr("stroke", (d: any) => 
                props.selectedSensor && d.type === "sensor" && d.name === props.selectedSensor ? "#000" : null
            )
            .attr("stroke-width", (d: any) => 
                props.selectedSensor && d.type === "sensor" && d.name === props.selectedSensor ? 2 : 0
            );

        // Agregar etiquetas a los nodos
        node.append("text")
            .text((d: any) => d.name)
            .attr("x", 20)
            .attr("y", 5)
            .style("font-size", "12px")
            .style("fill", "#333");

        // Actualizar posiciones en cada tick
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        // Funciones de arrastre
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Diagrama del Sistema</h3>
                <div className="card-tools">
                    <button 
                        type="button" 
                        className="btn btn-tool" 
                        onClick={loadData}
                        disabled={loading}
                        title="Recargar datos"
                    >
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-12">
                        {loading && (
                            <div className="d-flex justify-content-center mb-3">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Cargando...</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}
                        <div className="d-flex justify-content-center">
                            <svg ref={svgRef}></svg>
                        </div>
                        <div className="mt-4">
                            <h5>Leyenda:</h5>
                            <div className="d-flex gap-4">
                                <div>
                                    <span className="badge" style={{ backgroundColor: '#4e79a7', width: '20px', height: '20px', display: 'inline-block' }}></span>
                                    <span className="ml-2">Organización</span>
                                </div>
                                <div>
                                    <span className="badge" style={{ backgroundColor: '#f28e2c', width: '20px', height: '20px', display: 'inline-block' }}></span>
                                    <span className="ml-2">Dispositivo</span>
                                </div>
                                <div>
                                    <span className="badge" style={{ backgroundColor: '#e15759', width: '20px', height: '20px', display: 'inline-block' }}></span>
                                    <span className="ml-2">Nodo</span>
                                </div>
                                <div>
                                    <span className="badge" style={{ backgroundColor: '#76b7b2', width: '20px', height: '20px', display: 'inline-block' }}></span>
                                    <span className="ml-2">Sensor</span>
                                </div>
                                {props.selectedSensor && (
                                    <div>
                                        <span className="badge" style={{ backgroundColor: '#ff0000', width: '20px', height: '20px', display: 'inline-block', border: '2px solid #000' }}></span>
                                        <span className="ml-2">Sensor Seleccionado</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diagrama;