import axios from "axios";
import React, { useEffect, useState } from "react";
import "./AdminUi.css";
import TableRow from "../TableRow/TableRow";
import SearchBar from "../SearchBar/SearchBar";
import Navigation from "../Navigation/Navigation";

const API_ENDPOINT = "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

export default function AdminUi(props) {
    const [fixedData, setFixedData] = useState([]);
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currPage, setCurrPage] = useState(1);
    const [index, setIndex] = useState({
        startIndex: 0,
        endIndex: 9,
    });
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedValues, setSelectedValues] = useState(new Set());
    const [multiSelects, setMultiSelects] = useState(new Set());

    useEffect(() => {
        fetchUsers(API_ENDPOINT);
    }, []);

    useEffect(() => {
        setTotalPages(prev => {
            if (users.length === 0) return 1

            return Math.ceil(users.length / 10);
        });
    }, [users]);

    useEffect(() => {
        const usersInRange = users.slice(index.startIndex, index.endIndex + 1);

        if (usersInRange.length < 10) {
            let idx = usersInRange.length;
            // This is done to add empty rows in case there is no data available
            for (; idx < 10; idx++) {
                usersInRange[idx] = undefined;
            }
        }

        setFilteredUsers(usersInRange);
    }, [users, index]);

    useEffect(() => {
        setIndex(prevIndex => {
            let startIndex = (currPage - 1) * 10;
            let endIndex = (currPage * 10) - 1;

            return {
                startIndex: startIndex,
                endIndex: endIndex > users.length - 1 ? users.length - 1 : endIndex
            }
        })
    }, [users, currPage]);


    const fetchUsers = async (url) => {
        try {
            const response = await axios.get(url);
            setFixedData(response.data);
            setUsers(response.data);
        } catch (e) {
            alert(e);
        }
    }

    const handleNext = (step) => {
        setCurrPage(prevPage => {
            const newPage = prevPage + step;
            if (newPage > totalPages) return prevPage;

            return newPage;
        });
    };

    const handlePrev = (step) => {
        setCurrPage(prevPage => {
            const newPage = prevPage - step;

            if (newPage < 1) return prevPage;

            return newPage;
        });
    };

    const handlePageSelect = (value) => {
        setCurrPage(value);
    };

    const handleDelete = (id) => {
        setUsers(prevUsers => {
            const arr = [...prevUsers];
            const idx = arr.findIndex(a => a.id === id);
            arr.splice(idx, 1);

            return arr;
        });

        setCurrPage(prev => {
            if ((index.startIndex === index.endIndex) && (index.startIndex !== 0) && (currPage === totalPages)) {
                return prev - 1;
            }

            return prev;
        })
    };

    /** DELETES SELECTED ITEMS */
    const handleDeleteSelected = () => {
        const currUsers = [...users];
        const toDelete = selectedValues;
        const newUsers = currUsers.filter(user => !(toDelete.has(user.id)));

        setSelectedValues(new Set());
        setMultiSelects(new Set());
        setUsers(newUsers);
        setCurrPage(prev => {
            if (prev === totalPages && prev !== 1) return prev - 1;

            return prev;
        })
    }

    const handleSelect = (id) => {
        setSelectedValues(prev => {
            const newSet = new Set(prev);

            if (prev.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }

            return newSet;
        });
    };

    const handleSelectAll = (e) => {
        const arr = users.slice(index.startIndex, index.endIndex + 1);
        const isChecked = e.target.checked;

        setMultiSelects(prev => {
            const newSet = new Set(prev);

            if (prev.has(currPage)) {
                newSet.delete(currPage);
            } else {
                newSet.add(currPage);
            }

            return newSet;
        });

        setSelectedValues(prev => {
            const newSet = new Set(prev);

            for (let i = 0; i < arr.length; i++) {
                if (isChecked) {
                    newSet.add(arr[i].id);
                } else {
                    newSet.delete(arr[i].id);
                }
            }

            return newSet;
        });
    };

    const handleEdit = (id, newName, newEmail, newRole) => {
        const currUsers = [...users];
        const position = currUsers.findIndex(a => a.id === id);

        const editedObj = currUsers[position];
        editedObj.name = newName;
        editedObj.email = newEmail;
        editedObj.role = newRole;

        setUsers(currUsers);
    };

    const handleSearch = (e) => {
        const value = e.target.value;

        if(value === '') {
            setUsers(fixedData);
            return;
        }

        const currUsers = [...fixedData];

        let newUsers = currUsers.filter(user => {
            let { id, name, email, role } = user;

            return (name.toLowerCase().includes(value) || email.includes(value) || role.includes(value));
        })

        setUsers(newUsers);
    };

    return (
        <div className="admin-ui">
            <SearchBar handleSearch={handleSearch} />
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={multiSelects.has(currPage)} onClick={(e) => handleSelectAll(e)} readOnly /></th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user, index) => {
                        if (typeof user === 'undefined') {
                            return <TableRow userData={user} key={totalPages * 10 * (index + 1)} />
                        }
                        return <TableRow userData={user} key={user.id} handleDelete={handleDelete} handleSelect={handleSelect} selectedValues={selectedValues} handleEdit={handleEdit} />;
                    })}
                </tbody>
            </table>
            <div className="controls-area">
                <button className="delete-selected-btn" disabled={selectedValues.size < 1} onClick={handleDeleteSelected}>Delete Selected</button>
                <Navigation pages={totalPages} currentPage={currPage} handleNext={handleNext} handlePrev={handlePrev} selectPage={handlePageSelect} />
            </div>
        </div>
    );
}