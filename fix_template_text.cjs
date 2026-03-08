const fs = require('fs');
const FILE_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/src/routes/script/ScriptView.tsx';

let content = fs.readFileSync(FILE_PATH, 'utf-8');

const saasText = `SaaS Dashboard Blueprint

1. What is the primary purpose of this dashboard?
[ e.g., Manage fitness clients, track financial metrics, monitor server health... ]

2. What key metrics need to be visible on the main overview?
[ e.g., MRR, Active Users, Churn Rate... ]

3. What navigation links should be in the sidebar?
[ e.g., Overview, Users, Settings, Billing... ]

4. Any specific styling preferences?
[ e.g., Dark mode, neon green accents, glassmorphism... ]`;

const portfolioText = `Minimalist Portfolio Blueprint

1. Who is this portfolio for?
[ e.g., Photographer, 3D Artist, Copywriter... ]

2. How should the work be displayed?
[ e.g., Full-screen masonry grid, horizontal scroll, single column... ]

3. What sections are required?
[ e.g., Hero introduction, Selected Works, About Me, Contact Form... ]

4. What is the desired vibe or animation style?
[ e.g., Monospaced fonts, subtle fade-ins, stark black and white... ]`;

const ecommerceText = `E-Commerce Store Blueprint

1. What type of products are being sold?
[ e.g., Luxury apparel, digital courses, handmade ceramics... ]

2. What are the key features of the product grid?
[ e.g., Hover to see alternate image, quick add-to-cart, filter sidebar... ]

3. Do you need specific components like a promotional banner or newsletter signup?
[ e.g., Yes, a scrolling marquee at the top and a footer signup... ]

4. What is the brand's primary color palette?
[ e.g., Earth tones, bold primary colors, pastel minimalism... ]`;

const linkInBioText = `Link-in-Bio Blueprint

1. Who is the creator or brand?
[ e.g., Twitch Streamer, Indie Musician, Local Bakery... ]

2. What are the top 3-5 links that need to be featured?
[ e.g., Latest YouTube video, Merch Store, Discord server, Spotify... ]

3. What social icons should be included at the bottom?
[ e.g., Instagram, TikTok, X (Twitter)... ]

4. Describe the background visual.
[ e.g., Animated gradient, blurred photo, solid dark color... ]`;

content = content.replace(
  /const SCRIPT_TEMPLATES = \[[\s\S]*?\];/,
  `const SCRIPT_TEMPLATES = [
    { title: "SaaS Dashboard", icon: LayoutTemplate, desc: "A sleek dark-mode dashboard for managing clients and metrics.", text: \`${saasText}\` },
    { title: "Minimalist Portfolio", icon: FileCode2, desc: "Full-screen masonry grid with subtle animations.", text: \`${portfolioText}\` },
    { title: "E-Commerce Store", icon: ShoppingBag, desc: "Modern storefront with product grid and cart.", text: \`${ecommerceText}\` },
    { title: "Link-in-Bio Page", icon: TerminalSquare, desc: "Mobile-first social links page with gradients.", text: \`${linkInBioText}\` }
  ];`
);

fs.writeFileSync(FILE_PATH, content);
