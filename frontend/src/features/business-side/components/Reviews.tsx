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
        <div className = "px-4 md:px-6 py-4">
            <div className="mb-4">
                <h1 className="font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide cursor-default">
                    Customer <span className="text-[#FFE2A0]">Reviews</span>
                </h1>
                <p className="text-white text-sm">Monitor and respond to your latest business feedback</p>
            </div>

            <div className = "flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-6 gap-3">
                <h2 className = "text-[#FFE2A0] text-xl font-['Playfair_Display'] font-semibold">Overall Rating</h2>
                <button className = "px-6 py-2 w-fit flex justify-center items-center cursor-pointer bg-[#3a3a3a] hover:bg-[#424242] border border-[#4d4d4d] rounded-xl transition-colors">
                    <p className = "text-white text-sm font-light">March 2021 - February 2022</p>
                </button>
            </div>

            <div className = "flex flex-col lg:flex-row gap-4">
                {/*Total review*/}
                <div className = "w-full flex-1 min-h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
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
                <div className = "w-full flex-1 min-h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
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
                <div className = "w-full flex-1 min-h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] flex flex-col justify-between rounded-xl">
                    
                        {ratingData.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3 w-full">
                                {/* Star Label */}
                                <div className="flex items-center gap-1 w-8 shrink-0">
                                    <span className="text-gray-400 text-sm">★</span>
                                    <span className="text-white text-sm font-medium">{item.stars}</span>
                                </div>

                                {/* Progress Bar Track */}
                                <div className="flex-1 h-2 bg-[#4b4b4b] rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${item.color} ${item.width}`} 
                                    />
                                </div>

                                {/* Count Label */}
                                <span className="text-gray-400 text-xs w-8 shrink-0 text-right">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                </div>
            </div>

            <div className="w-full h-px my-5 bg-[#4b4b4b]"></div>
            {/*Comments*/}
            <div className="mt-5">
                {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner transition-transform hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.154-.63 4.5 4.5 0 0 1 .767-2.327C3.392 16.483 2.25 14.366 2.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white text-xl font-semibold tracking-wide font-['Playfair_Display']">No Reviews Yet</h3>
                            <p className="text-[#a0a0a0] text-sm font-light max-w-xs mx-auto leading-relaxed">
                                Your customers haven't shared their feedback yet. Positive reviews will help you stand out!
                            </p>
                        </div>
                    </div>
                ) : (
                    reviews.map((rev, index) => (
                        <div key={rev.id} className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-8 max-w-7xl">
                        
                        {/* 1. LEFT COLUMN: USER PROFILE */}
                        <div className="w-full sm:w-70 flex flex-row items-start gap-4 shrink-0">
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
                                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
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
                    ))
                )}
            </div>
        </div>
    );
}

export default Review;