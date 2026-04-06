"use client"
import { useState } from 'react'

export default function Home() {
  const [lang, setLang] = useState('ar')
  const ar = lang === 'ar'

  return (
    <main style={{background:'#020C18',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial',position:'relative',overflow:'hidden',direction:ar?'rtl':'ltr'}}>

      <div style={{position:'absolute',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(0,212,255,0.06),transparent)',top:'10%',left:'20%'}}/>
      <div style={{position:'absolute',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.06),transparent)',bottom:'10%',right:'20%'}}/>

      {/* زر تبديل اللغة */}
      <div style={{position:'absolute',top:'24px',left:'24px',display:'flex',gap:'8px'}}>
        {['ar','en'].map(l=>(
          <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?'rgba(0,212,255,0.2)':'transparent',border:`1px solid ${lang===l?'#00D4FF':'rgba(255,255,255,0.2)'}`,borderRadius:'6px',padding:'6px 14px',color:lang===l?'#00D4FF':'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'12px',letterSpacing:'2px'}}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* البطاقة */}
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(0,212,255,0.15)',borderRadius:'16px',padding:'48px',width:'400px',textAlign:'center'}}>

        <div style={{fontSize:'10px',letterSpacing:'6px',color:'rgba(0,212,255,0.5)',marginBottom:'8px'}}>
          PROOF OF REALITY
        </div>
        <h1 style={{fontSize:'42px',fontWeight:'900',letterSpacing:'8px',background:'linear-gradient(135deg,#00D4FF,#8B5CF6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'8px'}}>
          VERAVOX
        </h1>
        <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',letterSpacing:'2px',marginBottom:'32px'}}>
          {ar ? 'البنية التحتية لليقين الرقمي' : 'Proof of Reality Infrastructure'}
        </p>

        {/* إيميل */}
        <div style={{marginBottom:'16px',textAlign:ar?'right':'left'}}>
          <label style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'2px',display:'block',marginBottom:'8px'}}>
            {ar ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <input type="email" placeholder={ar?'example@email.com':'example@email.com'} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:'8px',padding:'12px 16px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box',direction:'ltr'}}/>
        </div>

        {/* كلمة المرور */}
        <div style={{marginBottom:'24px',textAlign:ar?'right':'left'}}>
          <label style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'2px',display:'block',marginBottom:'8px'}}>
            {ar ? 'كلمة المرور' : 'Password'}
          </label>
          <input type="password" placeholder="••••••••" style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:'8px',padding:'12px 16px',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
        </div>

        {/* زر الدخول */}
        <button style={{width:'100%',background:'linear-gradient(135deg,#00D4FF,#0066FF)',border:'none',borderRadius:'8px',padding:'14px',color:'#020C18',fontSize:'15px',fontWeight:'900',letterSpacing:'3px',cursor:'pointer',marginBottom:'16px'}}>
          {ar ? 'دخول' : 'Sign In'}
        </button>

        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.3)'}}>
          {ar ? 'ليس عندك حساب؟ ' : "Don't have an account? "}
          <span style={{color:'#00D4FF',cursor:'pointer'}}>
            {ar ? 'سجل الآن' : 'Register'}
          </span>
        </p>

      </div>
    </main>
  )
}