import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import {Link} from 'react-router-dom'
import google from '@assets/google.png';
import facebook from '@assets/facebook.png';
import bg from '@assets/bg.png';

function Signin(){
    const [showPassword, setShowPassword] = useState(false);

    return(
        //bg with gradient
        <div 
        className = "min-h-screen bg-size-[1138] overflow-hidden"
        style = {{
            backgroundImage: `linear-gradient(to right, transparent -11%, rgba(34, 34, 34, 0.9), #222222 50%), url(${bg})`,
        }}
        >
            <div className = ""> 
                <svg className = "absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path 
                    d = "M 400 0 C 200 200, 600 400, 400 800"
                    transform = "translate(200, 0)" 
                    fill = "none" 
                    stroke = "white" 
                    stroke-width = "1" 
                    stroke-dasharray = "8 8" 
                    className = "opacity-30"
                    />
                </svg>
            </div>

            {/*Radial spotlight*/}
            <div className = "absolute w-190 h-170 translate-x-113 -mt-97 bg-radial from-[#FFE2A0]/80 via-[#FFE2A0]/20 to-transparent rounded-full blur-3xl opacity-60"></div>

            <div className = "motion-preset-slide-right motion-duration-800">
                <h1 className = "font-['Playfair_Display'] translate-x-30 mt-70 text-[80px] absolute font-bold text-[#FBFAF8] max-w-120 leading-tight">
                    Continue your Pampanga <span className = "text-[#FFE2A0]">Journey</span>
                </h1>
            </div>
            
            {/*Form*/}
            <div className = "motion-preset-slide-left motion-duration-800">
                <div className = "ml-180 mt-25 absolute">
                    <h1 className = "font-['Playfair_Display'] text-[#FBFAF8] text-5xl font-bold mb-2.5">
                        Sign in<span className = "text-[#FFE2A0]">.</span>
                    </h1>
                    <p className = "text-[#FBFAF8] text-s">Create your account to get started.</p>
                </div>

                {/*Email*/}
                <div className = "translate-x-180 mt-53 absolute">
                    <div className = "flex flex-col gap-2 absolute w-150">
                        <label className = "text-[#FBFAF8] text-md">
                            Email
                        </label>
                        <input
                            type = "text"
                            placeholder = "eg. juan.dc@gmail.com"
                            className = "bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none"
                        />
                    </div>
                </div>
                
                {/*Password*/}
                <div className = "translate-x-180 mt-79 absolute">
                    <div className = "flex flex-col gap-2 absolute w-150">
                        <label className = "text-[#FBFAF8] text-md">
                            Password
                        </label>
                        <input
                            type = {showPassword ? "text" : "password"}
                            placeholder = "************"
                            className = "bg-[#2E2E2E] text-white placeholder-gray-500 px-4 py-3 rounded-lg border-none focus:ring-1 focus:ring-white outline-none"
                        />
                        <button
                            type="button"
                            onClick = {() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                            >
                            {showPassword ? (
                                <EyeOff size={20} /> // "Hide" icon
                            ) : (
                                <Eye size={20} />    // "Show" icon
                            )}
                        </button>
                    </div>
                </div>

                {/*Sign in Button*/}
                <div className = "translate-x-180 mt-110 absolute">
                    <Link to = "/Homepage">
                        <button className = "px-4 py-3 bg-[#FFE2A0] hover:bg-[#fcd789] w-150 rounded-lg cursor-pointer font-semibold text-[#222222]">
                            Sign in
                        </button>
                    </Link>
                </div>

                {/*Don't have an Account*/}
                <div className = "translate-x-180 mt-126 absolute">
                    <p className = "text-[#FBFAF8]">
                        Don't have an Account? 
                        <span className = "text-[#FFE2A0] cursor-pointer"> Sign up</span>.
                    </p>
                </div>

                <div className = "absolute translate-x-180 mt-130 w-150">
                    <div className = "flex items-center my-4">
                        <div className = "grow border-t border-gray-600"></div>
                            <span className = "shrink mx-4 text-gray-400">Or</span>
                        <div className = "grow border-t border-gray-600"></div>
                    </div>
                </div>

                {/*Other methods (Google or Facebook)*/}
                <div className = "translate-x-180 mt-148 absolute">
                    <button className = "px-4 py-3 bg-[#222222] border border-gray-600 w-73 rounded-lg cursor-pointer text-white flex justify-center items-center gap-2">
                        <img src = {google}/>
                        Google
                    </button>
                </div>

                <div className = "translate-x-258 mt-148 absolute">
                    <button className = "px-4 py-3 bg-[#222222] border border-gray-600 w-73 rounded-lg cursor-pointer text-white flex justify-center items-center gap-2">
                        <img src = {facebook} />
                        FaceBook
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signin;