
const treeViewFunc = {
    pruneTree(tree, branchFieldSplitter, reverse) {
        // Prune the tree by collapsing nodes with single children
        const keys = Object.keys(tree);

        keys.forEach(key => {
            let nodeCollapsed = false
            let newKey = ""
            let node =  tree[key]
            
            do {
                // Collapse nodes (greeedy approach)
                nodeCollapsed = false

                if (!node.isTerminal) {
                    if (Object.keys(node.children).length === 1) {
                        const childNodeKey = Object.keys(node.children)[0]
                        const childNode = node.children[childNodeKey]
    
                        if (!childNode.isTerminal) {
                            // If parent contains single child and both parent and child are terminal, collapse the node
                            if (reverse) {
                                newKey = `${childNodeKey}${branchFieldSplitter}${key}`
                            } else {
                                newKey = `${key}${branchFieldSplitter}${childNodeKey}`
                            }
                            
                            // Delete the old node and create a new node with the combined key
                            delete tree[key]
                            tree[newKey] = { isTerminal: false, children: childNode.children, items: [] }
                            nodeCollapsed = true

                            key = newKey
                            node = tree[newKey]

                        }
                    }
                }
            } while (nodeCollapsed)
            
            this.pruneTree(tree[key].children, branchFieldSplitter, reverse)
        })
    },
    buildTree(items, branchField, branchFieldSplitter, reverse=false, secondaryBranch=false, secondaryBranchFieldSplitter) {
        const itemsTree = {}

        items.forEach(item => {
            const branchFieldValue = item?.[branchField]
            let branchFieldValueParts = branchFieldValue?.split(branchFieldSplitter)?.filter(part => part) || []
            
            if (reverse) {
                branchFieldValueParts.reverse()
            }

            let currentNode = itemsTree
            branchFieldValueParts.forEach((part, index) => {
                if (!currentNode[part]) {
                    // Create a new node if it does not exist
                    currentNode[part] = { isTerminal: false, children: {}, items: [] };
                }
                if (index === branchFieldValueParts.length - 1) {
                    // Mark the node as terminal if it is the last part of the branch and set items field
                    if (secondaryBranch) {
                        const secondaryBranchFieldValue = part
                        const secondaryBranchFieldValueParts = secondaryBranchFieldValue.split(secondaryBranchFieldSplitter).filter(part => part)
                        
                        if (secondaryBranchFieldValueParts.length == 2) {
                            // delete the created leaf node 
                            delete currentNode[part]

                            // create secondary branch node if it does not exist
                            const secondaryBranchFieldKey = secondaryBranchFieldValueParts[0]
                            if (!currentNode[secondaryBranchFieldKey]) {
                                currentNode[secondaryBranchFieldKey] = { isTerminal: false, children: {}, items: [] };
                            }

                            currentNode = currentNode[secondaryBranchFieldKey].children;
                            // create a new leaf node
                            currentNode[part] = { isTerminal: false, children: {}, items: [] };
                        }
                    }
                    
                    // Mark the node as terminal if it is the last part of the branch and set items field
                    currentNode[part].isTerminal = true; 
                    currentNode[part].items.push(item)
                }
                currentNode = currentNode[part].children;
            })
        })

        this.pruneTree(itemsTree, branchFieldSplitter, reverse)

        return itemsTree
    },
    convertToRATFormat(node, name="", leafNodeNameField) {
        // Convert the tree to the format required by react-accessible-treeview
        const result = { name, children: [], isTerminal: false};

        for (const key in node) {
            const currentNode = node[key];
            if (currentNode.isTerminal) {
                currentNode.items.forEach(item => {
                    result.children.push({
                        name: item[leafNodeNameField],
                        metadata: { ...item },
                        isTerminal: true,
                    });
                });
            } else {
                result.children.push(this.convertToRATFormat(currentNode.children, key, leafNodeNameField));
            }
        }

        const nonTerminalChildren = result.children
                                    .filter(child => !child.isTerminal)
                                    .sort((a, b) => a.name.localeCompare(b.name));

        const terminalChildren = result.children
                                    .filter(child => child.isTerminal)
                                    .sort((a, b) => a.name.localeCompare(b.name));

        // Make sure leaf nodes are at the end
        result.children = [ ...nonTerminalChildren, ...terminalChildren ]

        return result
    }
}

export default treeViewFunc;