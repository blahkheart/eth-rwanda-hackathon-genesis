import Image from "next/image";

interface HackerClass {
  name: string;
  description: string;
  image: string;
}

interface HackerClassCardProps {
  classType: HackerClass;
  onClick: (name: string) => void;
}

export function HackerClassCard({ classType, onClick }: HackerClassCardProps) {
  return (
    <div
      className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={() => onClick(classType.name)}
    >
      <Image src={classType.image} alt={classType.name} width={200} height={200} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{classType.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{classType.description}</p>
      </div>
      <div className="absolute top-0 right-0 m-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">NFT</div>
    </div>
  );
}
