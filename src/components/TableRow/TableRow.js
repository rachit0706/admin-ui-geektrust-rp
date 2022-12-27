import React, { useState } from "react";
import "./TableRow.css";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';

export default function TableRow({ userData, handleDelete, handleSelect, selectedValues, handleEdit }) {
    const [cellData, setCellData] = useState({
        id: userData ? userData.id : "",
        name: userData ? userData.name : "",
        email: userData ? userData.email : "",
        role: userData ? userData.role : ""
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleInput = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        
        setCellData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    };

    const saveChanges = (data) => {
        // Before sending new data to the state, some validation is necessary
        let nameFormat = /^[A-Za-z\s]+$/;
        let mailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(!nameFormat.test(data.name) || data.name.length <= 2) {
            alert("Enter a valid name");
            return;
        }else if(!mailformat.test(data.email)) {
            alert("Please enter a valid email");
            return;
        }

        handleEdit(data.id, data.name, data.email, data.role);
        setIsEditing(false);
    };

    return (
        <>
            {typeof userData === 'undefined' ? (
                <tr className="user-empty-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr >
            ) : (
                <tr className="user-data-row">
                    {!isEditing ? (
                        <>
                            <td><input type="checkbox" checked={selectedValues.has(userData.id)} onChange={() => handleSelect(cellData.id)} /></td>
                            <td>{cellData.name}</td>
                            <td>{cellData.email}</td>
                            <td>{cellData.role}</td>
                        </>
                    ) : (
                        <>
                            <td></td>
                            <td><input name="name" defaultValue={cellData.name} onChange={(e) => handleInput(e)} /></td>
                            <td><input name="email" defaultValue={cellData.email} onChange={(e) => handleInput(e)}  /></td>
                            <td>
                                <select name="role" value={cellData.role} onChange={(e) => handleInput(e)}>
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                </select>
                            </td>
                        </>
                    )}
                    {!isEditing ? (
                        <td>
                            <BorderColorRoundedIcon fontSize="small" className="edit-button" onClick={() => setIsEditing(true)} />
                            <DeleteOutlineRoundedIcon fontSize="small" className="delete-button" onClick={() => handleDelete(cellData.id)} />
                        </td>
                    ) : (
                        <td>
                            <button className="save-changes-btn" onClick={() => saveChanges(cellData)}>Save Changes</button>
                        </td>
                    )}
                </tr>
            )}
        </>
    );
}