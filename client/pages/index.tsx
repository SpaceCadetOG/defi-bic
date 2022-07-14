import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Content from './components/Content'
import Header from './components/Header'
import Sidebar from './components/Sidebar'


const Home = () =>
{
  return (
    <div className={styles.container}>
      <Head>
        <title>DefiBic</title>
        <meta name="description" content="PoweredByBicBlockchainSolutions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <Sidebar />
      <Header />
      <Content />

    </div>
  )
}

export default Home
