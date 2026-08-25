import { useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Transition,
} from 'motion/react';
import { BookOpen, Brain, MessageCircle, Search, Sparkles } from 'lucide-react';

export interface CardItem {
  id: number;
  title: string;
  description: string;
  label: string;
  destination: string;
  icon: ReactNode;
}

interface CardCarouselProps {
  items?: CardItem[];
  onNavigate?: (destination: string) => void;
}

const DEFAULT_CARDS: CardItem[] = [
  { id: 1, title: 'Read with curiosity', description: 'Notice what stands out before worrying about the perfect terminology.', label: 'Begin here', destination: 'start', icon: <BookOpen /> },
  { id: 2, title: 'Notice the choice', description: 'Find one deliberate detail in the language, structure or presentation.', label: 'Explore analysis', destination: 'paper-1', icon: <Search /> },
  { id: 3, title: 'Explain the effect', description: 'Ask how that choice guides a reader and shapes the larger meaning.', label: 'Build confidence', destination: 'paper-1', icon: <Brain /> },
  { id: 4, title: 'Make connections', description: 'Compare ideas and methods across works—not only what happens in them.', label: 'See Paper 2', destination: 'paper-2', icon: <Sparkles /> },
  { id: 5, title: 'Find your voice', description: 'Turn your thinking into a clear line that another person can follow.', label: 'Explore the IO', destination: 'io', icon: <MessageCircle /> },
];

const ITEM_WIDTH = 320;
const GAP = 16;
const STEP = ITEM_WIDTH + GAP;
const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS: Transition = { type: 'spring', stiffness: 330, damping: 30 };

interface CarouselCardProps {
  item: CardItem;
  index: number;
  x: ReturnType<typeof useMotionValue<number>>;
  onNavigate: (destination: string) => void;
}

function CarouselCard({ item, index, x, onNavigate }: CarouselCardProps) {
  const range = [-STEP * (index + 1), -STEP * index, -STEP * (index - 1)];
  const rotateY = useTransform(x, range, [78, 0, -78], { clamp: false });
  const scale = useTransform(x, range, [0.9, 1, 0.9], { clamp: false });
  const opacity = useTransform(x, range, [0.7, 1, 0.7], { clamp: false });

  return (
    <motion.article className="swipe-card" style={{ width: ITEM_WIDTH, rotateY, scale, opacity, flexShrink: 0 }} transition={SPRING_OPTIONS}>
      <div className="swipe-icon">{item.icon}</div>
      <span className="swipe-number">0{item.id}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onPointerDown={(event) => event.stopPropagation()} onClick={() => onNavigate(item.destination)}>
        {item.label}
      </motion.button>
    </motion.article>
  );
}

export default function CardSwipe({ items = DEFAULT_CARDS, onNavigate }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const maxIndex = Math.max(items.length - 1, 0);

  if (!items.length) return null;

  const navigate = (destination: string) => onNavigate ? onNavigate(destination) : (location.hash = destination);
  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.x < -DRAG_BUFFER || info.velocity.x < -VELOCITY_THRESHOLD) setCurrentIndex((previous) => Math.min(previous + 1, maxIndex));
    else if (info.offset.x > DRAG_BUFFER || info.velocity.x > VELOCITY_THRESHOLD) setCurrentIndex((previous) => Math.max(previous - 1, 0));
  };

  return (
    <div className="card-swipe" aria-roledescription="carousel" aria-label="A path through DP English">
      <div className="swipe-window">
        <motion.div className="swipe-track" drag="x" dragConstraints={{ left: -(STEP * maxIndex), right: 0 }} dragElastic={0.12} style={{ gap: GAP, perspective: 1000, perspectiveOrigin: currentIndex * ITEM_WIDTH + ITEM_WIDTH / 2, x }} onDragEnd={handleDragEnd} animate={{ x: -(currentIndex * STEP) }} transition={SPRING_OPTIONS}>
          {items.map((item, index) => <CarouselCard key={item.id} item={item} index={index} x={x} onNavigate={navigate} />)}
        </motion.div>
      </div>
      <div className="swipe-controls" aria-label="Choose a carousel card">
        {items.map((item, index) => <button key={item.id} type="button" className={currentIndex === index ? 'active' : ''} aria-label={`Show ${item.title}`} aria-current={currentIndex === index ? 'true' : undefined} onClick={() => setCurrentIndex(index)} />)}
      </div>
      <p className="swipe-hint">Drag to explore · {currentIndex + 1} of {items.length}</p>
    </div>
  );
}
