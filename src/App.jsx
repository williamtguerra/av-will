import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge } from '@xyflow/react';

import './App.css'
import '@xyflow/react/dist/style.css'

const makeFlowNodes = (nodesData) => {
    let nodes = []
    for (let i = 0; i < nodesData.length; i++) {
        const n = nodesData[i]
        const { id, data, position } = n
        const formId = data['component_id']
        const node = {
            id,
            position,
            formId,
            data: {
                label: data.name,
            },
        }
        nodes.push(node)
    }
    return nodes
}

const makeFlowEdges = (edgeData) => {
    let edges = []
    for (let i = 0; i < edgeData.length; i++) {
        const e = edgeData[i]
        const { source, target } = e
        const edge = {
            id: `id${i}`,
            source,
            target,
        }
        edges.push(edge)
    }
    return edges
}

const makeForms = (formData) => {
    let forms = {}
    for (let i = 0; i < formData.length; i++) {
        const f = formData[i]
        forms[f.id] = f
    }
    return forms
}

function App() {
    const [activeForm, setActiveForm] = useState({})
    const [nodes, setNodes] = useNodesState([])
    const [edges, setEdges] = useEdgesState([])
    const [forms, setForms] = useState({})

    const fetchEndpoint = async () => {
        const actionBlueprintId = 'bp_01jk766tckfwx84xjcxazggzyc' // ?
        const tenantId = '1'
        const url = `http://localhost:3000/api/v1/${tenantId}/actions/blueprints/${actionBlueprintId}/graph`

        const response = await fetch(url)
        const body = await response.json()

        if (body) {
            setForms({ ...makeForms(body.forms) })
            setNodes(makeFlowNodes(body.nodes))
            setEdges(makeFlowEdges(body.edges))
        } 
        return true
    }

    const handleNodeClick = useCallback((_, node) => {
        const { formId } = node
        setActiveForm({...forms[formId]})
    }, [forms])

    const renderForm = (f) => {
        const schema = f['ui_schema']
        const {elements} = schema
        return <ul>{elements.map((e, i) => <li key={`element-${i}`}>{e.label}</li>)}</ul>
    }

    const dismissForm = () => {
        setActiveForm({})
    }

    useEffect(() => {fetchEndpoint()}, [])

    return (
        <>
            <div style={{ width: '100vw', height: 'calc(100vh - 120px)' }}>
                <ReactFlow
                    colorMode="dark"
                    nodes={nodes}
                    edges={edges}
                    // onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                />
            </div>
            <div className="control-panel">
                {/* <button onClick={fetchEndpoint}>fetch</button> */}
                <button onClick={dismissForm}>dismiss form</button>
                <div className="form">
                    {'id' in activeForm && renderForm(activeForm)}
                </div>
            </div>
        </>
    )
}

export default App
