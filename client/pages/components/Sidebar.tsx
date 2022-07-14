import React, { Component } from 'react'
import styles from "../../styles/Home.module.css";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ThumbsUpDownOutlinedIcon from "@mui/icons-material/ThumbsUpDownOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import CandlestickChartOutlinedIcon from "@mui/icons-material/CandlestickChartOutlined";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

type Props = {}

type State = {}

export default class Sidebar extends Component<Props, State> {
    state = {}

    render()
    {
        return (
            <div className={styles.sidebarcontainer}>
                <div className={styles.logo}>
                    <h2>DefiBic</h2>
                    <div className={styles.wrapper}>
                        <ul>
                            <li>
                                <AccountBalanceOutlinedIcon color="primary" style={{ width: "18px", cursor: "pointer" }} />
                                <a href="#">Lend</a>
                            </li>
                            <li>
                                <LocalAtmOutlinedIcon color="secondary" style={{ width: "18px", cursor: "pointer" }} />
                                <a href="#">Deposit</a>
                            </li>
                            <li>
                                <ThumbsUpDownOutlinedIcon color="primary" style={{ width: "18px", cursor: "pointer" }} />
                                <a href="#">Flashloan</a>
                            </li>
                            <li>
                                <InsightsOutlinedIcon color="secondary" style={{ width: "18px", cursor: "pointer" }} />
                                <a href="#">Analytics</a>
                            </li>
                            <li>
                                <SwapHorizontalCircleIcon color="primary" style={{ width: "18px", cursor: "pointer" }} />
                                <a href="#">Swap</a>
                            </li>
                            <li>
                                <MoreHorizIcon color="secondary" style={{ width: "18px", cursor: "pointer" }} />
                                <a href="#">More</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}    