# Francis — final project tasks

## Ownership: order and custom drink experience

- [ ] Study the Order and drink-making storyboard frames; plan a manageable interaction with the group.
- [ ] Build the order section with vanilla JavaScript and connect it to the menu.
- [ ] Let customers choose drink options and see the cup update; animate ingredients such as falling ice using the browser's WebGL API and vanilla JavaScript. Do not use Three.js or other UI libraries.
- [ ] Show selected options and calculate totals only from verified prices; handle changes and reset.
- [ ] Make controls keyboard accessible and provide a reduced-motion alternative.
- [ ] Label the order flow as a demonstration unless an actual ordering channel is connected; never imply an order was sent or stored when it was not.
- [ ] Explain the animation, DOM updates, and limitations during the demonstration.

Coordinate product data and links with Fritz and overall styles with Ace.

## Vercel hosting

- [ ] Import the team's GitHub repository into Vercel and deploy it as a static website.
- [ ] Confirm that the public URL opens without a login and that the home page, internal links and assets work. Share the URL with the team and Mesiah for the report.
- [ ] Coordinate live checks of every page, interaction and responsive layout with the team. Redeploy and recheck after changes, and keep the site accessible during evaluation.

## Detailed implementation

Design references: [Order](https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=26-4639), [drink storyboard](https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=26-4980), and [dark Order](https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=54-1072).

- [ ] Inspect the order layout, controls and summary, plus the storyboard's empty cup, coffee, ice, sugar and finished drink stages. Use the designs as the target.
- [ ] Agree with Fritz on an initial verified drink, available options and prices, and how the menu links to the order experience.
- [ ] Create the order page or section with HTML and CSS. Adapt the Figma layout to smaller screens and coordinate shared styles with Ace.
- [ ] Build a simple WebGL canvas scene with a cup, camera and lighting. Add coffee and ice after the basic scene displays. Animate coffee pouring and ice falling when chosen; add more effects once the core flow works.
- [ ] Use labeled HTML controls outside the canvas for size, ice, sweetness and available add-ons. Allow changes and reset, and keep the visible drink and summary consistent with selections.
- [ ] Provide a simple fallback when WebGL is unavailable. Check keyboard use, visible focus, reduced motion, repeated changes, reset and mobile performance.
- [ ] Share your feature explanation, asset sources and checks with Mesiah for the report. Be ready to explain and modify your own code.

## Shared requirements

- [ ] Use semantic HTML5, CSS3, and vanilla JavaScript; no front-end or CSS frameworks or UI libraries.
- [ ] Follow the relevant Figma design and coordinate shared styles and files before editing.
- [ ] Make the work usable on mobile, tablet, and desktop; check keyboard focus, labels, contrast, and meaningful image alt text.
- [ ] Verify business details and prices; do not invent claims. Record asset sources and AI assistance.
- [ ] Review your changes with the team and be ready to explain your code during the presentation.

Figma: https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=0-1

The assignment requires four distinct pages, working navigation and form validation, and at least two more working interactive features. All features must actually work.
