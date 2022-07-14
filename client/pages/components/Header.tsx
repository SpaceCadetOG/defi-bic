import { Avatar } from "@mui/material";
import React from "react";
import styles from "../../styles/Home.module.css";
type Props = {}

// connect to web 3 using metamask
export default function Header({ }: Props)
{

    return (
        <div className={styles.headercontainer}>
            <div className={styles.headerwrapper}>
                <div className={styles.title}>
                    <p>acct: { }
                        <span>0xdef2897b62948AeEC4216Aa1AADD880947D6C319</span>
                    </p>
                </div>
                <div className={styles.profile}>
                    <Avatar sx={{ bgcolor: "blue" }} variant="square"></Avatar>
                </div>
            </div>
        </div>
    );
}