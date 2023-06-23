import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';


const Editor = ({socketRef, roomId, onCodeChange}) => {
    const editorRef=useRef(null);
    useEffect(()=>{
        async function init(){
            editorRef.current= CodeMirror.fromTextArea(document.getElementById("realtimeEditor"),{
                mode:{name:'javascript',json:true },
                theme:'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers:true,
            } );

            editorRef.current.on('change',(instance,changes)=>{
                // console.log(changes);
                const {origin}=changes;
                const code=instance.getValue();
                onCodeChange(code);
                // console.log(code);
                if(origin !== 'setValue'){
                    // console.log(code);
                    socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                        roomId,
                        code,
                    })
                }


            });

            // socketRef.current.on(ACTIONS.CODE_CHANGE,({code})=>{
            //     if(code !== null ){
            //         editorRef.current.setValue(code);   
            //     }
                
            // })


        }
        init();




    },[]);
    // issue is: editor component is rendering and using socketref(which is null initially) before it recieves socketref.current not null(ie, a proper connection) from the parent's useref
    useEffect(()=>{
        if(socketRef.current){
            socketRef.current.on(ACTIONS.CODE_CHANGE,({code})=>{
                if(code !== null){
                    editorRef.current.setValue(code);   
                }
            })
        }

        return ()=>{
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }

    },[socketRef.current]);


    return <textarea id="realtimeEditor"></textarea>;
  
}

export default Editor