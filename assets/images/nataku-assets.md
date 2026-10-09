# Nataku image assets

Prepared with the built-in image_gen tool from the second reference image supplied in the conversation. The mascot keeps the character's green skin, brown glasses, rust-red sweater, trousers, and curled tail. The background branding was removed for use in the app.

- `nataku-mascot.png`: transparent full-body mascot for onboarding, authentication, lessons, and splash.
- `nataku-icon.png`: opaque cream portrait for the app icon, brand header, and profile avatar fallback.

## Final mascot prompt

Use case: background-extraction. Asset type: transparent PNG mascot for the Nataku English School mobile app. Input images: Image 1 is the Nataku wordmark for brand context only; Image 2 is the edit target. Primary request: extract ONLY the green glasses-wearing reptile character from Image 2, removing every part of the beige textured background and all background Nataku/English School lettering. Preserve the character's identity extremely faithfully: same olive-green skin and darker spots, large amber eyes, round brown glasses, friendly closed-mouth smile, rust-red ribbed sweater, brown trousers, orange and green curled tail, dark brown outlines, same three-quarter standing pose with hands in pockets. Do not redesign, recolor, simplify, change expression, or add any props. Keep the illustration style and detailed sweater ribbing identical. Include the whole tail and character centered with minimal clear padding; reconstruct only the tiny missing bottom of the trousers/feet that is cut off by the source boundary, in exactly the same style. Output one single character on a genuinely transparent alpha background, no text, no logo, no backdrop, no drop shadow around the canvas. Preserve the shape and visible colors of Image 2.

## Final icon prompt

Use case: precise-object-edit. Asset type: 1024x1024 square app icon and profile avatar for Nataku. Edit target: the supplied transparent Nataku mascot file. Make a tightly framed head-and-upper-shoulders portrait of this EXACT same green reptile character, centered on a completely flat opaque warm cream background (#E6DFCF). Preserve its olive-green skin, spots, orange head spines, round dark brown spectacles, amber eyes, friendly closed-mouth smile, rust-red sweater, thick dark brown outlines, same three-quarter orientation, and original illustration rendering exactly. This is a crop/composition of the same character, not a redesign. Fit the whole head and glasses inside the central 70 percent of the square so circular launcher masks do not clip it. Small upper-shoulder sweater at the bottom. No text, letters, brand wordmark, extra props, gradients, frame, or border. The corners must contain the flat opaque cream background, no transparency.
