// LinkItem.js
import Link from "next/link";

const LinkItem = ({href, title, description}: { href: string, title: string, description: string }) => (
    <Link
        href={href}
        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 z-10"
        target="_blank"
        rel="noopener noreferrer"
    >
        <h2 className="mb-3 text-2xl font-semibold">
            {title} <span
            className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
        </h2>
        <p className="m-0 max-w-[30ch] text-sm opacity-50">{description}</p>
    </Link>
);

// LinksGrid.js
const LinksGrid = ({links}: { links: { href: string, title: string, description: string }[] }) => {


    return (
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
            {links.map((link, index) => (
                <LinkItem key={index} href={link.href} title={link.title} description={link.description}/>
            ))}
        </div>
    );
};

export default LinksGrid;
