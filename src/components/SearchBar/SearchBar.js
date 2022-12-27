import React from "react";
import "./SearchBar.css";

export default function SearchBar({ handleSearch }) {
    return (
        <input type="text" placeholder="Search by Name, Email or Role" className="search-bar" onChange={(e) => handleSearch(e)} />
    )
}