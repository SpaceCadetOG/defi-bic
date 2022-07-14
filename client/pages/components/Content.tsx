import React from 'react'
import styles from "../../styles/Home.module.css";
type Props = {}

export default function Content({}: Props) {
    return (
        <div className={styles.contentcontainer}>
          <div className={styles.contentwrapper}>
            
            <div className={styles.tabs}>
              <div className={styles.catergories}>
                <h2>Swap</h2>
              </div>
            </div>
    
            <div className={styles.tabs}>
              <div className={styles.catergories}>
                <h2>Flashloan</h2>
              </div>
            </div>
    
            <div className={styles.tabs}>
              <div className={styles.catergories}>
                <h2>AddLiquidty</h2>
              </div>
            </div>
    
    
          </div>
        </div>
      );
    }