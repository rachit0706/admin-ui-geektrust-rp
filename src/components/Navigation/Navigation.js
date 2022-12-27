import React, { useEffect, useState } from "react";
import "./Navigation.css";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

export default function Navigation({ pages, currentPage, handleNext, handlePrev, selectPage }) {
    const [pageNums, setPageNums] = useState([]);

    useEffect(() => {
        const arr = [];

        for(let i = 0; i < pages; i++) {
            arr.push(i + 1);
        }
        setPageNums(arr);
    }, [pages]);

    return (
        <div className="navigation">
            <button className="navi-btn" onClick={() => handlePrev(2)} disabled={currentPage === pageNums[0] || currentPage === pageNums[1]}>
                <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </button>
            <button className="navi-btn" onClick={() => handlePrev(1)} disabled={currentPage === 1}>
                <KeyboardArrowLeftIcon fontSize="small" />
            </button>
            <div className="page-bubbles">
                {pageNums.map((count, index) => (
                    <span className={currentPage === count ? "page-bubble selected-page" : "page-bubble" }key={index} onClick={() => selectPage(count)} >{count}</span>
                ))}
            </div>
            <button className="navi-btn" onClick={() => handleNext(1)} disabled={currentPage === pages} >
                <KeyboardArrowRightIcon fontSize="small" />
            </button>
            <button className="navi-btn" onClick={() => handleNext(2)} disabled={currentPage === pageNums[pageNums.length - 1] || currentPage === pageNums[pageNums.length - 2]} >
                <KeyboardDoubleArrowRightIcon fontSize="small" />
            </button>
        </div>
    );
}