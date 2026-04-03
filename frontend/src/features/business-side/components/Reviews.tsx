function Review(){
    const rating = 4;

    const ratingData = [
        { stars: 5, count: "2.0k", color: "bg-[#2eb09c]", width: "w-[80%]" },
        { stars: 4, count: "1.0k", color: "bg-[#c084fc]", width: "w-[50%]" },
        { stars: 3, count: "500",  color: "bg-[#fbbf24]", width: "w-[25%]" },
        { stars: 2, count: "200",  color: "bg-[#22d3ee]", width: "w-[10%]" },
        { stars: 1, count: "0k",   color: "bg-[#f97316]", width: "w-[5%]" },
    ];

    {/*Sample lng to dpt yung comments dito is connected dun sa cinocomment ng user sa customer side*/}
    const reviews = [
        {
            id: 1,
            name: "Lebron James",
            avatar: "https://mn2s.com/wp-content/uploads/2022/10/LeBron-James.png", // Placeholder avatar
            rating: 4,
            date: "24-10-2022",
            comment: "Grabeng lugar yan nakaka relax. I'm definitely ballin again dito sa coffee shop na to worth it yung Le Meat nila grabe."
        },
        
        {
            id: 1,
            name: "Anthony Davis",
            avatar: "https://s3media.247sports.com/Uploads/Assets/539/529/9529539.jpg", // Placeholder avatar
            rating: 4,
            date: "04-07-2022",
            comment: "Naalala kopa nung dito kami nag d-date ni Lebron e, sarap mag reminisce."
        },

        {
            id: 1,
            name: "June Mar Fajardo",
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKM7i-yyH6jisX1ZejkwYtZjXKydGoBszdfg4I5JunCDshtCrtIOnkC97UwQEWk_vgBW-ewbvFIYOvIuWgvV67FE4gy176KuQ3j1Kx0mtJmw&s=10", // Placeholder avatar
            rating: 4,
            date: "24-10-2022",
            comment: "Sarap tumambay dito"
        },
        
        {
            id: 1,
            name: "Dwight Ramos",
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5gjKC8fOBp8KB0kMhDPdlS4EWQQCx0WFhKhltHbAG73n9Lh90bpO9sNLOdRzAB6z7UNxXzSZZrklsMHCsMhHt8TaJYzMUGx0WVbIhlZXLHw&s=10", // Placeholder avatar
            rating: 4,
            date: "04-07-2022",
            comment: "Maganda yung place."
        },
    ];
    
    return(
        <div className = "px-6 py-4">
            <div className = "flex flex-row items-center justify-between mb-3">
                <h1 className = "font-semibold text-xl tracking-wide text-white mb-3">Reviews</h1>
                <button className = "w-60 px-3 py-3 flex justify-center items-center cursor-pointer bg-[#3a3a3a] hover:bg-[#424242] border border-[#4d4d4d] rounded-xl">
                    <p className = "text-white">March 2021 - February 2022</p>
                </button>
            </div>

            <div className = "flex flex-row gap-3">
                {/*Total review*/}
                <div className = "w-100 h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
                    <p className = "text-white text-lg font-semibold tracking-wide mb-4">Total Reviews</p>
                    <div>
                        <div className = "flex flex-row just items-center gap-3 mb-2">
                            <p className = "text-5xl font-Normal text-white">10.0k</p>

                            <div className = "p-1 w-18 bg-green-300 rounded-full flex flex-row justify-center items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className = "size-4 text-green-700">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                </svg>
                                <p className = "text-sm text-green-700">21%</p>
                            </div>
                        </div>

                        <p className = "text-[#dbdbdb]">Growth in reviews on this year</p>
                    </div>
                </div>

                {/*Average Rating*/}
                <div className = "w-100 h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
                    <p className = "text-white text-lg font-semibold tracking-wide mb-4">Average Rating</p>
                    <div>
                        <div className = "flex flex-row just items-center gap-3 mb-2">
                            <p className = "text-5xl font-Normal text-white">4.0</p>

                            <div className = "flex flex-row justify-center items-center gap-2">
                                <div className="flex flex-row justify-center items-center gap-1">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            viewBox="0 0 24 24"
                                            fill={index < rating ? "#FFB800" : "#4B4B4B"} // Gold for active, Dark Gray for empty
                                            className="size-7"
                                        >
                                            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <p className = "text-[#dbdbdb]">Average rating on this year</p>
                    </div>
                </div>

                {/*Progress*/}
                <div className = "w-100 h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] flex flex-col justify-between rounded-xl">
                    
                        {ratingData.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3">
                            {/* Star Label */}
                            <div className="flex items-center gap-1 min-w-7.5">
                                <span className="text-gray-400 text-md">★</span>
                                <span className="text-white text-sm font-medium">{item.stars}</span>
                            </div>

                            {/* Progress Bar Track */}
                            <div className="flex-1 h-2 bg-[#4b4b4b] rounded-full overflow-hidden">
                                <div 
                                className={`h-full rounded-full ${item.color} ${item.width}`} 
                                />
                            </div>

                            {/* Count Label */}
                            <span className="text-gray-400 text-xs min-w-7.5 text-right">
                                {item.count}
                            </span>
                            </div>
                        ))}
                </div>
            </div>

            <div className="w-285 h-px my-5 bg-[#4b4b4b]"></div>

            {/*Comments*/}
            <div className="mt-5 px-10">
                {reviews.map((rev, index) => (
                    <div key={rev.id} className="flex gap-10 mb-8 max-w-7xl">
                    
                    {/* 1. LEFT COLUMN: USER PROFILE */}
                    <div className="w-70 flex flex-row items-start gap-4 shrink-0">
                        <img 
                        src={rev.avatar} 
                        alt={rev.name} 
                        className="size-25 rounded-xl object-cover" 
                        />
                        <div className="flex flex-col gap-1 mt-1">
                        <h2 className="text-white text-md font-semibold tracking-wide">
                            {rev.name}
                        </h2>
                        </div>
                    </div>

                    {/* 2. RIGHT COLUMN: REVIEW CONTENT */}
                    <div className="flex-1">
                        {/* Header: Stars and Date */}
                        <div className="flex items-center gap-3 mb-3 mt-1">
                        <div className="flex flex-row gap-0.5">
                            {[...Array(5)].map((_, i) => (
                            <svg key={i} viewBox="0 0 24 24" fill={i < rev.rating ? "#FFB800" : "#4B4B4B"} className="size-4">
                                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                            ))}
                        </div>
                        <span className="text-[#9ca3af] text-sm">{rev.date}</span>
                        </div>

                        {/* Review Text */}
                        <p className="text-[#e5e7eb] text-md leading-relaxed tracking-wide">
                        {rev.comment}
                        </p>

                        {/* Divider (Optional: Hides on the last item) */}
                        {index !== reviews.length - 1 && (
                            <div className="w-full h-px mt-8 mb-2 bg-[#4b4b4b]"></div>
                        )}
                        
                    </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Review;