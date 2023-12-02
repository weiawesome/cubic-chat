import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { Box } from '@react-three/drei';
import "./App.css"
import Markdown from "react-markdown";
import OpenAI from "openai";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const RotatingCube: React.FC = () => {
    const cubeRef = useRef<THREE.Mesh>(null);
    const [rotationSpeed] = useState(0.01);
    const [color, setColor] = useState<string>('pink');

    // Function to generate a random color
    const getRandomColor = (): string => {
        const letters = '0123456789ABCDEF';
        let newColor = '#';
        for (let i = 0; i < 6; i++) {
            newColor += letters[Math.floor(Math.random() * 16)];
        }
        return newColor;
    };

    useEffect(() => {
        // Change color every 5 seconds with a smooth transition
        const colorInterval = setInterval(() => {
            const newColor = getRandomColor();
            setColor(newColor);
        }, 5000);

        return () => {
            clearInterval(colorInterval);
        };
    }, []); // Empty dependency array to run the effect only once

    useFrame(() => {
        if (cubeRef.current) {
            cubeRef.current.rotation.x += rotationSpeed;
            cubeRef.current.rotation.y += rotationSpeed;
        }
    });

    return (
        <Box ref={cubeRef} scale={[5, 5, 5]} position={[0, 0, -10]}>
            <meshStandardMaterial attach="material" color={color} />
        </Box>
    );
};




const App: React.FC = () => {
    const [content,setContent]=useState("")
    const apikeyRef=useRef<HTMLInputElement|null>(null);
    const questionRef=useRef<HTMLInputElement|null>(null);
    const [loading,setLoading]=useState(false);
    async function chat() {
        setLoading(true);
        try{
            let openai = new OpenAI({apiKey:String(apikeyRef.current?.value),dangerouslyAllowBrowser: true});
            const completion = await openai.chat.completions.create({
                messages: [{"role": "system", "content": "對於問題都以繁體中文且markdown語法回答且階層式的顯示，並且根據問題採用條列式回答逐一分析並且帶出可以延伸思考的概念。"},{"role": "user", "content": String(questionRef.current?.value)},],
                model: "gpt-3.5-turbo",
            });
            setContent(String(completion.choices[0]["message"]["content"]));
        } catch (e){
            toast.error(String(e));
        } finally {
            setLoading(false);
        }
    }
    return (
        <main>
            <ToastContainer />
            <h1 className={"Title-Text"}>Cubic Chat</h1>
            <div className={"block"}>
                <h2 style={{width:"30%"}}>API KEY</h2>
                <input ref={apikeyRef} type={"text"} placeholder={"YOUR OPENAI API KEY"} style={{width:"70%"}}/>
            </div>
            <h2>Chat Now</h2>
            <div className={"block"}>
                <div style={{width:"20%"}}>
                    <Canvas camera={{ position: [0, 0, 5] }}>
                        <ambientLight />
                        <pointLight position={[10, 10, 10]} />
                        <RotatingCube />
                    </Canvas>
                </div>
                <div className={"chat-block"} style={{flex:1}}>
                    <div style={{display:"flex",flexDirection:"row",justifyContent:"space-evenly"}}>
                        <input ref={questionRef} type={"text"} placeholder={"YOUR QUESTION"}/>
                        {loading?<div className="loading-spinner"></div>:<button className={"ChatButton"} onClick={chat}>詢問</button>}
                    </div>
                    <Markdown>{content}</Markdown>
                </div>
            </div>
            <h3>Power by openai api</h3>
        </main>
    );
};

export default App;
