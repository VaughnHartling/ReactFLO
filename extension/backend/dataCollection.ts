import { 
  DisplayNode,
  State,
} from './interfaces';


class SimpleNode implements DisplayNode {
  id: number;
  displayName: string;
  tag: number;
  type: any;
  props: State[] | null = [];
  state: State[] | null = [];
  children: DisplayNode[] = [];
  parent: string | null = null;
  constructor(node: any) {
    this.id = node._debugID;
    this.tag = node.tag;
    this.type = node.type;
    this.state = convertState(node);
    this.props = convertProps(node);
  }
}

// STATE
// Check for hooks
// If memoizedState.memoizedState && _debugHookTypes = ['useState']
// Extract state labels from elementType - Need to convert function to string and extract

// Check for component state
// Check if tag === 1
// If so, memoizedState will be an object of key/value pairs of component state

const convertState = (node) => {
  if(!node.memoizedState) return;
  // Create representations of state which can be queried
  const stateArray: State[] = [];
  for (const key in node.memoizedState) {
    // console.log(counter,' ', `${key}: `, node.memoizedState[key]);
    try {
      // Create a prop object
      const state: State = {
        // Store values in object
        key,
        value: node.memoizedState[key] || null,
        topComponent: null,
        components: [],
        type: 'componentState',
      };
      // Push object to props array
      stateArray.push(state);
    } catch (error) {
      console.log('error: ', key);
      console.log('error: ', node.memoizedState[key]);
      continue;
    }
  }
  return stateArray;
}

// PROPS
// memoizedProps will be an object of key/value pairs of props
// We can also check tag to check for what type of component it is
  
const convertProps = (node) => {
  // Check if node has props
  // If not return null
  if (!node.memoizedProps) return null;
  // Create props array
  const props: State[] = [];
  // Iterate through memoizedProps.props
  for (const key in node.memoizedProps) {
    try {
      // Create a prop object
      const prop: State = {
        // Store values in object
        key,
        value: node.memoizedProps[key] || null,
        topComponent: null,
        components: [],
        type: 'prop',
      };
      // Push object to props array
      props.push(prop);
    } catch (error) {
      continue;
    }
  }
  // Return props array
  return props;
}

const filterNode = (node) => {
  if (node.tag === 0 || node.tag === 1) return false
  else return true;
  if (!node.type) return true;
  if (node.type.name === undefined) return true;
  return false;
}

const convertStructure = (node) => {
  // Convert dual linked list structure into graph
  // Create a new node
  const convertedNode = new SimpleNode(node);
  // Add child to array
  if (!node.child) return convertedNode;
  convertedNode.children.push(convertStructure(node.child));
  // ConvertStructure() of each sibling and sibling of sibling etc. and add them to children array
  let childNode = node.child;
  while(childNode.sibling) {
    convertedNode.children.push(convertStructure(childNode.sibling));
    childNode = childNode.sibling;
  }
  // Check if node should be filtered out
  if (filterNode(convertedNode)) {
    return convertedNode.children ? convertedNode.children[0] : null;
  }
  // Return converted node
  return convertedNode;
}

export const extractData = (node) => {
  return convertStructure(node);
}