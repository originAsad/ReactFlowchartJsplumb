/* eslint react/prop-types: 0 */
import React from 'react';
import {Modal,Input,Button} from 'antd';
import { jsPlumb } from 'jsplumb';
import uuidv1 from 'uuid/v1';


const DynamicAnchors = ['Left', 'Right', 'Top', 'Bottom']
const connectorStyle = { stroke: '#7AB02C', strokeWidth: 2, joinstyle: 'round' }
const connectorHoverStyle = { stroke: '#5c96bc', strokeWidth: 3 }
const endpointStyle = { fill: 'transparent', stroke: '#7AB02C', radius: 7, strokeWidth: 1 }
const endpointHoverStyle = { fill: '#5c96bc', stroke: '#5c96bc', radius: 7, strokeWidth: 1 }

const anEndpoint = {
  connector: 'Flowchart',
  endpoint: 'Dot',
  isSource: true,
  isTarget: true,
  paintStyle: endpointStyle,
  hoverPaintStyle: endpointHoverStyle,
  connectorStyle: connectorStyle,
  connectorHoverStyle: connectorHoverStyle
}
const Common = {
  anchor: 'AutoDefault',
  connector: 'Flowchart',
  endpoint: 'Dot',
  paintStyle: connectorStyle,
  hoverPaintStyle: connectorHoverStyle,
  endpointStyle,
  endpointHoverStyle
}
export default class RightArea extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ' Enter Text',
            initialized: false,
            dialogVisible_one: false,
            dialogVisible_two: false,
            datas: null,
            betas: null,
            dialogTitle: '',
            labelText: '',
            nodes: [],
            edges: [],
            info: null,
            texts: [],
            nodetext: [],
            edit: null,
            index: null,
            ntext:[],
        };
    
        this.handleChange = this.handleChange.bind(this);
}
  componentDidMount() {
    this.init();
    this.refs.nodes = [];
  }
  componentWillMount = () => {

  }
  hideModal_one = () => {
    this.setState({dialogVisible_one:false});
  }
  hideModal_two = () => {
        this.setState({ dialogVisible_two: false ,texts:[]});
    }
    addProcess() {
        this.setState({ texts: [...this.state.texts, ""] });
    }
    handleChange(e, index) {
        //eslint-disable-next-line
        this.state.texts[index] = e.target.value
        this.setState({ texts: this.state.texts })

    }
    handleRemove(index) {
        this.state.texts.splice(index, 1)
        this.setState({ texts: this.state.texts })
    }

  init = () => {
    this.rjsp = jsPlumb.getInstance({
      ConnectionOverlays: [
      ['Arrow', { location: 1, id: 'arrow', width: 11, length: 11 }],
      ['Label', { location: 0.3, id: 'label', cssClass: 'jsp-label', events: {
        dblclick: info=>this.editLabelText(info)
      } }]
      ]
    })
    this.props.jsp.droppable(this.refs.right, { drop: this.jspDrop })
    this.rjsp.bind('beforeDrop', this.jspBeforeDrop)
    this.fetchData()
  }
  
    fetchData = (datas,betas) => {
        var nodeData;
        
        this.setState({ datas: datas });
        nodeData = this.state.datas;
        if (this.state.datas) {
            this.setState({ datas: nodeData, nodes: nodeData.nodes, edges: nodeData.edges }, () => {
                this.initNodes(this.refs.nodes);
                this.initEdges(nodeData.edges);
            });
        }
    else {
            var jsonString = '{"nodes":[{"className":"rect","id":"0c3dda60-5793-11e9-8e5a-7998c6fd625e","text":"Start","style":{"left":"122.265625px","top":"63px"}},{"className":"circle","id":"0d4426d0-5793-11e9-8e5a-7998c6fd625e","text":"End","style":{"left":"127.265625px","top":"372px"}}],"process":[{"name":"End1"},{"name":"End2"}],"edges":[]}'
            nodeData = JSON.parse(jsonString);
          
            this.setState({ datas: nodeData, nodes: nodeData.nodes, edges: nodeData.edges }, () => {
                this.initNodes(this.refs.nodes);
                this.initEdges(nodeData.edges);
            });
        }
  }


  jspBeforeDrop = (info) => {
    info.targetId = info.dropEndpoint.elementId
    let connections = this.rjsp.getConnections({ source: info.sourceId, target: info.targetId })
    if (info.targetId === info.sourceId) {
      Modal.warning({
          title: 'You cannot connect yourself'
      });
    } else {
      if (connections.length === 0) {  
        this.setState({info});
        this.addEdge(info);
      } else {
        Modal.warning({
            title: 'There can only be one connection between two nodes'
        })
      }
    }
  }

  jspDrop = (info) =>{
      this.setState({ info });
      let nodes = JSON.parse(JSON.stringify(this.state.nodes));
      nodes.push(this.createNode(info.drag.el, info.drop.el));
      this.setState({ nodes },()=>{
      this.initNodes(this.refs.nodes[this.state.nodes.length-1]);
    });
  }

  createNode = (dragEl, dropEl) => {
    let rect = dropEl.getBoundingClientRect()
    return {
      className: dragEl.classList[0],
        id: uuidv1(),
        text: dragEl.innerText,
      style: {
        left: this.props.pos[0] - rect.left - dropEl.clientLeft + 'px',
        top: this.props.pos[1] - rect.top - dropEl.clientTop + 'px',
      }
    }
  }

  initNodes = (node) => {
    this.rjsp.draggable(node, {constrain:true});
    this.rjsp.setSuspendDrawing(true);
    DynamicAnchors.map(anchor => this.rjsp.addEndpoint(node, anEndpoint, { anchor }));
    this.rjsp.setSuspendDrawing(false,true); 
  }

  initEdges = (edges) => {
    this.rjsp.setSuspendDrawing(true);
    edges.map(edge => this.rjsp.connect(edge, Common).getOverlay('label').setLabel(edge.labelText))
    this.rjsp.setSuspendDrawing(false,true);
  }

    editLabelText = (info) => {
        
        this.setState({ dialogVisible_one: true, info: info.component, labelText: info.labelText });
    }
    editProcess = (info, node,ntext) => {

        this.setState({ dialogVisible_two: true, info: info.component, ntext: node.text, nodeid: node.id, edit: node, nodetext: node.text });
        console.log(this.state.ntext)
    }
  activeElem = () => {
    console.log('I have been clicked');
  }

  deleteNode = (event, node) => {
    event.stopPropagation();
    this.rjsp.deleteConnectionsForElement(node.id);
    let edges = this.rjsp.getAllConnections().map(connection => {
      return {
        source: connection.sourceId,
        target: connection.targetId,
        labelText: connection.getOverlay('label').labelText
      }
    });
    let nodes = Object.assign([],this.state.nodes);
    nodes.splice(nodes.findIndex(n=>n.id===node.id),1);
    this.setState({datas:{nodes,edges},nodes,edges}, ()=>{
      this.reload();
    });
  }
    hideModal = () => {
        this.setState({ dialogVisible_one: false });
    }
  addEdge = (info) => {
    this.rjsp.connect({ source: info.sourceId, target: info.targetId }, Common);
  }

    reload = () => {

    this.clearAll();
    this.setState({
      nodes: this.state.datas.nodes,
      edges: this.state.datas.edges
    })
    this.rjsp.bind('beforeDrop', this.jspBeforeDrop);
    this.initNodes(this.refs.nodes.filter(refNode=>refNode));  
    this.initEdges(this.state.edges);
  }

  clearAll = () => {
    this.rjsp.reset();
    this.setState({nodes:[]});
  }

  changeLabel = (e) => {
    let value = e.target.value;
    this.setState({labelText:value});
  }

  saveLabel = () => {
    this.state.info.getOverlay('label').setLabel(this.state.labelText);
    this.hideModal();
    }

    saveProcess = () => {
        let node = this.state.edit;

        let nodes = [...this.state.nodes];

        let index = nodes.findIndex(el => el.id === node.id);
        
        nodes[index].text = this.state.texts;
        this.setState({ nodes: nodes, dialogVisible_two: false });
   
    }

    saveDatas = () => {
    let datas = {
      nodes: this.state.nodes.map((node, index) => {
          node.style = this.getStyle(this.refs.nodes[index])
          this.hideModal_two();
        return node
        }),
      edges: this.rjsp.getAllConnections().map(connection => {
        return {
          source: connection.sourceId,
          target: connection.targetId,
          labelText: connection.getOverlay('label').labelText
        }
      })
    }
      this.setState({ datas });
      this.props.saveDatas(datas);

  }

  getStyle (node) {
    let container = this.refs.right.getBoundingClientRect()
    let rect = node.getBoundingClientRect()
    return {
      left: rect.left - container.left - this.refs.right.clientLeft + 'px',
      top: rect.top - container.top + - this.refs.right.clientTop + 'px'
    }
  }

    render() {
    return (
      <div className="right-area" ref="right">
        <div  className="demo">
                <Button type="primary" onClick={this.saveDatas}>Preservation</Button>
                <Button type="primary" onClick={this.clearAll}>Clear</Button>
                <Button type="primary" onClick={this.fetchData}>Reload</Button>
        </div>
  
         
            <Modal
                title="Enter the text of the connection"
                visible={this.state.dialogVisible_one}
                onCancel={this.hideModal_one}
                footer={[
                    <Button key="back" onClick={this.hideModal_one}>cancel</Button>,
                    <Button key="submit" type="primary" onClick={this.saveLabel} data-dismiss="modal">
                        Save
            </Button>
                ]}>
                <Input placeholder="Basic usage" value={this.state.labelText} onChange={this.changeLabel} />
            </Modal>

            <Modal
                title="Edit the Process"
                visible={this.state.dialogVisible_two}
                onCancel={this.hideModal_two}
                id={this.state.nodeid}
                footer={[
                    <Button key="back" onClick={this.hideModal_two}>cancel</Button>
                ]}>
               
                <form>
                 
                    {console.log(this.ntext)}
 
                    {this.state.texts.map((text, index) => (
                      <div className="shareholder" key={index}>
          
                            <input
                                type="text"
                                onChange={(e) => this.handleChange(e, index)}
                                defaultValue={this.state.ntext} /> 
                            <button
                                type="button"
                                onClick={()=>this.handleRemove(index)}
                                 className="small">
                                -
                           </button>                            
                        </div> 
                    ))}
                    <button
                        type="button"
                        onClick={(e) => this.addProcess(e)}
                        className="small"
                    >
                        Add Process
        </button>
                    <button
                        type="button"
                        onClick={(e)=>this.saveProcess(e)}
                        className="small">
                        Edit
        </button>
             
                </form>
           </Modal>


            {this.state.nodes.map((node, index) => {
                const showbutton = node.className === 'square';
                const decisionbutton = node.className === 'diamond';
             
         return(
          <div
                 key={index}
                 className={'node ' + node.className}
                 id={node.id}
                 ref={nodes => this.refs.nodes[index] = nodes}
                 style={node.style}
                 onClick={this.activeElem}
          
             >
               
                {node.text+'\n'}
                 {showbutton
               ?  <div className="add-btn" onClick={event => this.editProcess(event, node,index)}>+</div>
               :  <p></p>
                 }
           
                 {decisionbutton
                     ? <div className="add-btn" onClick={event => this.editProcess(event, node, index,node.text)}>+</div>
                     : <p></p>
                 }
            <div className="delete-btn" onClick={event=>this.deleteNode(event,node)}>X</div>
          </div>
                )
           })}
            
      </div>
    );
  }
}

