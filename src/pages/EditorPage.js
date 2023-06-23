import { logDOM } from '@testing-library/react'
import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import { initSocket } from '../socket'
import ACTIONS from '../Actions'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';

const EditorPage = () => {
    const [clients,setClients]=useState([]);
    const socketRef=useRef(null);
    const codeRef=useRef(null);
    const location= useLocation();  
    const reactNavigator= useNavigate();
    // const [searchParams, setSearchParams] = useSearchParams();
    const {roomId}= useParams();
    // const roomId=searchParams.get("roomId");
    useEffect(()=>{
        const init= async () => {
            socketRef.current= await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));   
            function handleErrors(e){
                console.log('socket error',e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }
            


            socketRef.current.emit(ACTIONS.JOIN,{
                roomId,  
                username : location.state?.username,
            });

            // listening to others joining
            socketRef.current.on(ACTIONS.JOINED,({clients,username,socketId})=>{
                if(username!== location.state?.username){
                    toast.success(`${username} joined the room`);
                    
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE,{
                    code : codeRef.current,
                    socketId,
                })    
            })

            //listening for others disconnecting
            socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,username})=>{
                toast.success(`${username} left the room.`);
                setClients((prev)=>{
                    return prev.filter((client)=> client.socketId!==socketId);
                })
            })

            return ()=>{
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.disconnect();
            }

        }
        init();
    },[]);

    async function copyRoomId(){
        try{
            await navigator.clipboard.writeText(roomId);
            toast.success('Room Id has been copied to your clipboard');
        }catch(err){
            toast.error('Could not copy the Room Id');
            console.log(err);
        }
    }

    function leaveRoom(){
        reactNavigator('/');
        socketRef.current.disconnect();     
    }

    
    if(!location.state){
        return <Navigate to='/' />;
    }




  return (
    <div className='mainWrap'>
        <div className='aside'>
            <div className='asideInner'>
                <h1 className='title'>CodePool</h1>
                <h3>Connected</h3>
        
                <div className='clientsList'>
                    {

                        clients && clients.map((client)=>(
                            <Client key={client.socketId} username={client.username} />
                        )) 
                        
                    }
                </div>



            </div>
            <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
            <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>

        </div>
        <div className='editorWarp'>
           <Editor socketRef={socketRef} roomId={roomId} onCodeChange={
            (code)=>{
                codeRef.current=code;
            }
           }  />
        </div>


    </div>
  )
}

export default EditorPage