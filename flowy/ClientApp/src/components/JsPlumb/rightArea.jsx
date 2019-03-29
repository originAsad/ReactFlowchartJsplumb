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

  state = {
    initialized: false,
    dialogVisible: false,
    datas: null,
    dialogTitle: '',
    labelText: '',
    nodes: [],
    edges: [],
    info: null,
  }
 
  componentDidMount() {
    this.init();
    this.refs.nodes = [];
    
  }
  componentWillMount = () => {

  }
  hideModal = () => {
    this.setState({dialogVisible:false});
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
 
    fetchData = (datas) => {
        console.log(this.state.datas);
        this.setState({ datas: datas });
       var nodeData = this.state.datas;
        if (this.state.datas) {
            console.log('I am here');
            this.setState({ datas: nodeData, nodes: nodeData.nodes, edges: nodeData.edges }, () => {
                this.initNodes(this.refs.nodes);
                this.initEdges(nodeData.edges);
           
            });
        }
    else {
            console.log('Return am here');
            var jsonString = '{"nodes":[{"className":"square","id":"64d442f0-3d3a-11e8-bf11-4737b922d1c3","text":"开始","style":{"left":"172px","top":"29px"}},{"className":"circle","id":"6575b310-3d3a-11e8-bf11-4737b922d1c3","text":"过程","style":{"left":"157.515625px","top":"175px"}},{"className":"rect","id":"660cea00-3d3a-11e8-bf11-4737b922d1c3","text":"结束","style":{"left":"188.515625px","top":"350px"}}],"edges":[{"source":"64d442f0-3d3a-11e8-bf11-4737b922d1c3","target":"6575b310-3d3a-11e8-bf11-4737b922d1c3","labelText":"sdd"},{"source":"6575b310-3d3a-11e8-bf11-4737b922d1c3","target":"660cea00-3d3a-11e8-bf11-4737b922d1c3","labelText":"sdssd"}]}';
            var nodeData = JSON.parse(jsonString);
            console.log(nodeData)
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
      if (connections.length === 0) {  // 检察是否已经建立过连接
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
    this.setState({info});
    let nodes = JSON.parse(JSON.stringify(this.state.nodes));
    nodes.push(this.createNode(info.drag.el, info.drop.el));
    this.setState({nodes},()=>{
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
        top: this.props.pos[1] - rect.top - dropEl.clientTop + 'px'
        // lineHeight: dragEl.clientHeight + 'px'
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

  editLabelText = (info) => {;
    this.setState({dialogVisible:true, info: info.component, labelText:info.labelText});
  }

  activeElem = () => {
    console.log('activeElem');
  }

  deleteNode = (event,node) => {
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
    this.initNodes(this.refs.nodes.filter(refNode=>refNode));  // 删除一个节点后，它对应的ref为null，要去掉
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

  saveDatas = () => {
    let datas = {
      nodes: this.state.nodes.map((node, index) => {
        node.style = this.getStyle(this.refs.nodes[index])
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
      console.log(datas);
      //var nodeData = JSON.stringify(datas);

      //this.setState({ datas: nodeData, nodes: nodeData.nodes, edges: nodeData.edges }, () => {
      //    this.initNodes(this.refs.nodes);
      //    this.initEdges(nodeData.edges);
      //});
 
     
  }

  getStyle (node) {
    let container = this.refs.right.getBoundingClientRect()
    let rect = node.getBoundingClientRect()
    return {
      left: rect.left - container.left - this.refs.right.clientLeft + 'px',
      top: rect.top - container.top + - this.refs.right.clientTop + 'px'
    }
  }

  render(){
    return (
      <div className="right-area" ref="right">
        <div  className="demo">
                <Button type="primary" onClick={this.saveDatas}>Preservation</Button>
                <Button type="primary" onClick={this.clearAll}>Clear</Button>
                <Button type="primary" onClick={this.fetchData}>Reload</Button>
        </div>
        <Modal
          title="Edit the text of the connection"
          visible={this.state.dialogVisible}
          onCancel={this.hideModal}
          footer={[
              <Button key="back" onClick={this.hideModal}>cancel</Button>,
            <Button key="submit" type="primary" onClick={this.saveLabel}>
              determine
            </Button>
          ]}>
          <Input placeholder="Basic usage" value={this.state.labelText} onChange={this.changeLabel}/>
            </Modal>
         
           
        {this.state.nodes.map((node,index)=>{
         return(
          <div
            key={index}
            className={'node '+node.className}
            id={node.id}
            ref={nodes=>this.refs.nodes[index]=nodes}
            style={node.style}
            onClick={this.activeElem}
          >
            {node.text}
            <div className="delete-btn" onClick={event=>this.deleteNode(event,node)}>X</div>
          </div>
          )
            })}
            
      </div>
    );
  }
}

