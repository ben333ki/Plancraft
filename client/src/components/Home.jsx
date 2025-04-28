import React, { useEffect, useState } from 'react';
import Leaves from './Leaves';
import '../styles/Home.css';
import Navbar from './Navbar';

const Home = () => {
  return (
    <>
    <Navbar />
    <div className="home-bg">
    <div className="content">
      <div className="content-home">
        <img src="/Image/logo-name.png" alt="Plancraft Logo" />
        <div className="content-text">
          <p>
            Plancraft เป็นเว็บไซต์ที่ออกแบบมาเพื่อช่วยอำนวยความสะดวกในการเล่นเกม Minecraft
            ซึ่งพัฒนาโดย Mojang Studios โดยมีการรวบรวมข้อมูลที่ไม่เป็นทางการเกี่ยวกับตัวเกมไว้
            ผู้ใช้งานสามารถเริ่มต้นใช้งานได้โดยศึกษาวิธีการใช้งานได้ดังนี้
          </p>
        </div>

        <div className="function-website">
          <img src="/Image/BG-function.png" alt="Background Function" />
          <div className="function-container">
            <h1>ระบบที่มีอยู่ในเว็บไซต์</h1>

            <a href="#" className="function-box">
              <img src="/Image/icon-craft.png" alt="Craft Icon" />
              <div className="function-box-content">
                <h1>ระบบ Craft</h1>
                <p>ดูอุปกรณ์ที่ต้องใช้ในการคราฟ จำนวน และที่มาของอุปกรณ์ที่ต้องใช้ในการคราฟของไอเทมนั้นๆ</p>
              </div>
            </a>

            <a href="#" className="function-box">
              <img src="/Image/Wheat.webp" alt="Farm Icon" />
              <div className="function-box-content">
                <h1>ระบบ Farm</h1>
                <p>ดูไอเทมที่จะได้รับจากฟาร์ม ไอเทม/จำนวนที่ใช้สร้างฟาร์ม วิดิโอตัวอย่างการสร้างฟาร์ม</p>
              </div>
            </a>

            <a href="#" className="function-box">
              <img src="/Image/icon-to do list.png" alt="To Do List Icon" />
              <div className="function-box-content">
                <h1>To do list</h1>
                <p>ช่วยจัดการงานที่ต้องทำ สำหรับการเล่นเกม Minecraft</p>
              </div>
            </a>

            <a href="#" className="function-box">
              <img src="/Image/icon-calculator.png" alt="Calculator Icon" />
              <div className="function-box-content">
                <h1>คำนวน</h1>
                <p>คำนวนจำนวนของไอเทมที่ต้องการจะใช้</p>
              </div>
            </a>

          </div>
        </div>

        <div className="contact">
          <h1>ช่องทางข่าวสาร</h1>
          <div className="social-links">

            <a href="https://www.facebook.com/minecraft/" target="_blank" rel="noopener noreferrer" className="social-btn">
              <img src="/Image/icon-fb.png" alt="Facebook" />
              <span>Facebook</span>
            </a>

            <a href="https://www.youtube.com/Minecraft" target="_blank" rel="noopener noreferrer" className="social-btn">
              <img src="/Image/icon-youtube.png" alt="YouTube" />
              <span>Youtube</span>
            </a>

            <a href="https://discord.com/invite/minecraft" target="_blank" rel="noopener noreferrer" className="social-btn">
              <img src="/Image/icon-discord.webp" alt="Discord" />
              <span>Discord</span>
            </a>

          </div>
        </div>

      </div>
    </div>
    </div>
    </>
  );
};

export default Home;