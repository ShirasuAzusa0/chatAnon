import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardTitle } from '@/components/ui/card';

interface RoleCardProps {
  id: number;
  name: string;
  description: string;
  image: string;
  collections?: number;
  likes?: number;
}

function RoleCard({ id, name, description, image, collections = 0, likes = 0 }: RoleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="overflow-hidden pt-0 transition-shadow duration-300 hover:shadow-lg">
      <div
        className="relative h-48 w-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={image} alt={name} className="h-full w-full object-cover" />
        {isHovered && (
          <div className="absolute right-2 bottom-2">
            <Link to={`/role-info/${id}`}>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/30 backdrop-blur-md hover:bg-white/80"
              >
                查看角色
              </Button>
            </Link>
          </div>
        )}
      </div>
      <CardFooter className="flex flex-col items-start">
        <div className="flex w-full justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="text-muted-foreground flex items-center space-x-1 text-sm">
              <Bookmark className="h-4 w-4" />
              <span>{collections}</span>
            </div>
            <div className="text-muted-foreground flex items-center space-x-1 text-sm">
              <Heart className="h-4 w-4" />
              <span>{likes}</span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </CardFooter>
    </Card>
  );
}

export default RoleCard;
