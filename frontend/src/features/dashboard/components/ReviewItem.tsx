import starIcon from '@assets/icons/star-icon.svg';

interface ReviewItemProps {
    user: string;
    initials: string;
    date: string;
    rating: number;
    comment: string;
}

function ReviewItem({ user, initials, date, rating, comment }: ReviewItemProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2E2E2E] flex items-center justify-center text-[10px] font-bold">
                        {initials}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user}</span>
                        <span className="text-xs text-zinc-500">{date}</span>
                    </div>
                </div>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <img 
                            key={i} 
                            src={starIcon} 
                            width="9" 
                            alt="review star" 
                            className={i < rating ? 'opacity-100' : 'opacity-30'}
                        />
                    ))}
                </div>
            </div>
            <p className="text-base text-zinc-400 leading-relaxed pr-4">
                {comment}
            </p>
        </div>
    );
}

export default ReviewItem;
