import React from 'react'
import { ArrowUpRight, Bus, Clapperboard, ShoppingCart, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
    { title: 'Transport Request', icon: Bus, color: 'text-[#8390FF]', bg: 'bg-[#263164]', link: "/transports" },
    { title: 'Media Request', icon: Clapperboard, color: 'text-[#A78BFA]', bg: 'bg-[#39285d]', link: "/media" },
    { title: 'Purchase Request', icon: ShoppingCart, color: 'text-[#19D399]', bg: 'bg-[#143d3d]', link: "/purchase" },
    { title: 'Food & Refreshment Request', icon: Utensils, color: 'text-[#FB923C]', bg: 'bg-[#432a1e]', link: "/IndividualFoodAndRefreshment" },
]

const FacultyQuickActions = () => {
    return (
        <section className="mt-4 rounded-lg border border-[#263044] bg-[#151d2d] px-4 py-3">
            <h2 className="text-lg font-medium text-white">Quick Action</h2>
            <div className="mt-1 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {actions.map(({ title, icon: Icon, color, bg, link }) => (
                    <Link to={link}
                        key={title}
                        className="group relative  rounded-lg border border-[#2a3449] bg-[#20283a] px-3 py-2 text-left transition hover:bg-linear-to-r hover:from-[#131530] hover:shadow-lg shadow-slate-900"
                    >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}>
                            <Icon size={17} />
                        </div>
                        <ArrowUpRight size={17} className="absolute right-4 top-4 text-[#FFFFFF80] transition group-hover:text-white" />
                        <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
                        <p className="mt-1 text-[10px] leading-4 text-[#FFFFFF80]">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default FacultyQuickActions
