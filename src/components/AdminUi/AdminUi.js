import axios from "axios";
import React, { useEffect, useState } from "react";
import "./AdminUi.css";
import TableRow from "../TableRow/TableRow";
import SearchBar from "../SearchBar/SearchBar";
import Navigation from "../Navigation/Navigation";

const API_ENDPOINT = "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

export default function AdminUi(props) {
    // This fixedData state acts like a helper to the search function. When the user has no query on the search bar it helps to display the original users data present before the search was typed.
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
    // Used to store the select all checkboxes present on each page.
    const [multiSelects, setMultiSelects] = useState(new Set());

    useEffect(() => {
        fetchUsers(API_ENDPOINT);
    }, []);

    // Sets the total number of pages after users data is recieved from the api. It also makes sure that empty page is still displayed when there are zero users.
    useEffect(() => {
        setTotalPages(prev => {
            if (users.length === 0) return 1

            return Math.ceil(users.length / 10);
        });
    }, [users]);

    // It renders the actual users on each page based on the start and end index.
    useEffect(() => {
        const usersInRange = users.slice(index.startIndex, index.endIndex + 1);

        if (usersInRange.length < 10) {
            let idx = usersInRange.length;
            // This is done to add empty rows in case there is no data available for better UX.
            for (; idx < 10; idx++) {
                usersInRange[idx] = undefined;
            }
        }

        setFilteredUsers(usersInRange);
    }, [users, index]);

    // It changes the start and end index based on the current page.
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
            setUsers(response.data);
            setFixedData(response.data);
        } catch (e) {
            alert(e);
        }
    }

    // Both the below functions jump to next or previous page based on the value of step parameter.
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

    // It sets the current page when user clicks the page indicator in the navigation control.
    const handlePageSelect = (value) => {
        setCurrPage(value);
    };

    // Deletes a single user. Called by the delete button present in the action column of each row.
    const handleDelete = (id) => {
        const currUsers = [...users];
        const idx = currUsers.findIndex(a => a.id === id);
        currUsers.splice(idx, 1);

        setUsers(currUsers);
        setFixedData(currUsers);

        setCurrPage(prev => {
            if ((index.startIndex === index.endIndex) && (index.startIndex !== 0) && (currPage === totalPages)) {
                return prev - 1;
            }

            return prev;
        })
    };

    // Deletes selected items. Called by the delete selected button.
    const handleDeleteSelected = () => {
        const currUsers = [...users];
        const toDelete = selectedValues;
        const newUsers = currUsers.filter(user => !(toDelete.has(user.id)));

        setSelectedValues(new Set());
        setMultiSelects(new Set());
        setUsers(newUsers);
        setFixedData(newUsers);
        setCurrPage(prev => {
            if (prev === totalPages && prev !== 1) return prev - 1;

            return prev;
        })
    }

    // It selects the single row when user clicks the checkbox present on the leftmost row.
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

    // Called by the checkbox on the top left and selects all the item on the current page. 
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

    // Takes the current id of the edited element and the rest of the new data and then updates the users array.
    const handleEdit = (id, newName, newEmail, newRole) => {
        const currUsers = [...users];
        const position = currUsers.findIndex(a => a.id === id);

        const editedObj = currUsers[position];
        editedObj.name = newName;
        editedObj.email = newEmail;
        editedObj.role = newRole;

        setUsers(currUsers);
        setFixedData(currUsers);
    };

    // Provides functionality to search bar.
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
        });

        setCurrPage(1);
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