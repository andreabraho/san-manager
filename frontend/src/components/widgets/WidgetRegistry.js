import TextBlock from './TextBlock';
import ImageBanner from './ImageBanner';
import ImageText from './ImageText';
import Gallery from './Gallery';
import ProfileCard from './ProfileCard';
import ServiceCard from './ServiceCard';
import Divider from './Divider';
import CallToAction from './CallToAction';
import SocialLinks from './SocialLinks';
import ChatHelper from './ChatHelper';

/**
 * WidgetRegistry maps widget type keys (stored in DB) to their React components
 * and metadata used in the editor palette.
 *
 * To add a new widget:
 *   1. Create the component file following the BaseWidget interface
 *   2. Import it here
 *   3. Add an entry with key, label, defaultConfig, and defaultSize
 */
const WidgetRegistry = {
  TextBlock: {
    component: TextBlock,
    label: 'Text Block',
    defaultConfig: { title: 'Title', body: 'Your text here...', align: 'left', style: {} },
    defaultSize: { w: 6, h: 4 },
  },
  ImageBanner: {
    component: ImageBanner,
    label: 'Image Banner',
    defaultConfig: { imageUrl: '', overlayText: '', overlayPosition: 'center', style: {} },
    defaultSize: { w: 12, h: 6 },
  },
  ImageText: {
    component: ImageText,
    label: 'Image + Text',
    defaultConfig: { imageUrl: '', text: 'Your text here...', imagePosition: 'left', style: {} },
    defaultSize: { w: 8, h: 5 },
  },
  Gallery: {
    component: Gallery,
    label: 'Gallery',
    defaultConfig: { images: [], columns: 3, style: {} },
    defaultSize: { w: 12, h: 8 },
  },
  ProfileCard: {
    component: ProfileCard,
    label: 'Profile Card',
    defaultConfig: { imageUrl: '', name: 'Your Name', role: 'Your role', bio: '', style: {} },
    defaultSize: { w: 4, h: 6 },
  },
  ServiceCard: {
    component: ServiceCard,
    label: 'Service Card',
    defaultConfig: { serviceName: 'Service', price: '', description: '', duration: '', style: {} },
    defaultSize: { w: 4, h: 6 },
  },
  Divider: {
    component: Divider,
    label: 'Divider',
    defaultConfig: { lineStyle: 'solid', color: '#cccccc', spacing: 16, style: {} },
    defaultSize: { w: 12, h: 1 },
  },
  CallToAction: {
    component: CallToAction,
    label: 'Call to Action',
    defaultConfig: { label: 'Book an appointment', backgroundColor: '#1a73e8', textColor: '#ffffff', style: {} },
    defaultSize: { w: 6, h: 3 },
  },
  SocialLinks: {
    component: SocialLinks,
    label: 'Social Links',
    defaultConfig: { links: [], layout: 'row', showLabels: true, style: {} },
    defaultSize: { w: 8, h: 3 },
  },
  chat_helper: {
    component: ChatHelper,
    label: 'Chat Helper',
    defaultConfig: {
      title: 'Ask me anything',
      welcomeMessage: 'Hi! Ask me anything about our services.',
      placeholder: 'Type your question...',
      knowledge: '',
      accentColor: '#111111',
      style: {},
    },
    defaultSize: { w: 6, h: 8 },
  },
};

export default WidgetRegistry;
