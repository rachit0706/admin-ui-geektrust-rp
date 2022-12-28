export function editHelper(id, data, name, email, role) {
    const input = [...data];
    const positionToEdit = input.findIndex(a => a.id === id);

    const editedObj = input[positionToEdit];
    editedObj.name = name;
    editedObj.email = email;
    editedObj.role = role;

    return input;
}

export function deleteHelper(id, data) {
    const input = [...data];
    const deleteIndex = input.findIndex(a => a.id === id);
    input.splice(deleteIndex, 1);

    return input;
}

// toDelete here is the set of ids of the items to be deleted
export function deleteSelectedHelper(data, toDelete) {
    const input = [...data];
    const result = input.filter(item => !(toDelete.has(item.id)));

    return result;
}