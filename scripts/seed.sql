INSERT INTO recipes (id, created_by, household_id, visibility, title, description, servings, prep_time, cook_time, ingredients, method, tags)
VALUES
(
  gen_random_uuid(),
  (SELECT id FROM profiles LIMIT 1),
  NULL,
  'public',
  'Spaghetti Bolognese',
  'A rich, slow-cooked meat sauce served over spaghetti.',
  4, 15, 45,
  $$[{"name":"beef mince","quantity":"500g"},{"name":"spaghetti","quantity":"400g"},{"name":"onion","quantity":"1 large"},{"name":"garlic cloves","quantity":"3"},{"name":"chopped tomatoes","quantity":"400g tin"},{"name":"tomato puree","quantity":"2 tbsp"},{"name":"red wine","quantity":"150ml"},{"name":"beef stock","quantity":"150ml"},{"name":"olive oil","quantity":"2 tbsp"}]$$::jsonb,
  $$[{"step":1,"instruction":"Finely dice the onion and crush the garlic."},{"step":2,"instruction":"Heat olive oil in a large pan over medium heat. Soften the onion for 5 minutes, then add the garlic and cook for 1 minute more."},{"step":3,"instruction":"Add the beef mince, breaking it up with a spoon, and brown all over."},{"step":4,"instruction":"Stir in the tomato puree, then pour in the red wine. Simmer for 2 minutes."},{"step":5,"instruction":"Add the chopped tomatoes and stock. Season well, reduce heat to low, and simmer uncovered for 35 minutes."},{"step":6,"instruction":"Cook spaghetti according to packet instructions. Drain and serve topped with the Bolognese."}]$$::jsonb,
  ARRAY['pasta','italian','dinner']
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles LIMIT 1),
  NULL,
  'public',
  'Banana Pancakes',
  'Two-ingredient pancakes, naturally sweet and gluten-free.',
  2, 5, 10,
  $$[{"name":"ripe bananas","quantity":"2"},{"name":"eggs","quantity":"2"},{"name":"butter","quantity":"1 tsp"}]$$::jsonb,
  $$[{"step":1,"instruction":"Mash the bananas in a bowl until smooth."},{"step":2,"instruction":"Beat in the eggs until fully combined."},{"step":3,"instruction":"Melt butter in a non-stick pan over medium heat."},{"step":4,"instruction":"Pour small rounds of batter into the pan. Cook for 2 minutes until bubbles form, then flip and cook for 1 minute more."},{"step":5,"instruction":"Serve with honey or fresh fruit."}]$$::jsonb,
  ARRAY['breakfast','quick','gluten-free']
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles LIMIT 1),
  NULL,
  'public',
  'Chicken Caesar Salad',
  'Crispy chicken over cos lettuce with a classic Caesar dressing.',
  2, 15, 15,
  $$[{"name":"chicken breasts","quantity":"2"},{"name":"cos lettuce","quantity":"1 head"},{"name":"parmesan","quantity":"40g"},{"name":"croutons","quantity":"handful"},{"name":"Caesar dressing","quantity":"4 tbsp"},{"name":"olive oil","quantity":"1 tbsp"},{"name":"salt and pepper","quantity":"to taste"}]$$::jsonb,
  $$[{"step":1,"instruction":"Season chicken breasts with salt and pepper. Pan-fry in olive oil over medium-high heat for 6 to 7 minutes each side until cooked through."},{"step":2,"instruction":"Rest the chicken for 5 minutes, then slice."},{"step":3,"instruction":"Tear lettuce into a large bowl. Add croutons and most of the parmesan."},{"step":4,"instruction":"Drizzle over the Caesar dressing and toss to coat."},{"step":5,"instruction":"Top with sliced chicken and the remaining parmesan. Serve immediately."}]$$::jsonb,
  ARRAY['salad','lunch','chicken']
),
(
  gen_random_uuid(),
  (SELECT id FROM profiles LIMIT 1),
  NULL,
  'public',
  'Lemon Drizzle Cake',
  'A light, zesty loaf cake with a crunchy sugar topping.',
  8, 20, 35,
  $$[{"name":"self-raising flour","quantity":"175g"},{"name":"caster sugar","quantity":"175g"},{"name":"unsalted butter, softened","quantity":"175g"},{"name":"eggs","quantity":"3"},{"name":"lemons (zest and juice)","quantity":"2"},{"name":"icing sugar","quantity":"85g"}]$$::jsonb,
  $$[{"step":1,"instruction":"Preheat oven to 180C (160C fan). Grease and line a 900g loaf tin."},{"step":2,"instruction":"Beat together the butter and caster sugar until pale and fluffy."},{"step":3,"instruction":"Beat in the eggs one at a time, then fold in the flour and lemon zest."},{"step":4,"instruction":"Pour into the prepared tin and bake for 30 to 35 minutes until a skewer comes out clean."},{"step":5,"instruction":"Mix the lemon juice with the icing sugar to make the drizzle."},{"step":6,"instruction":"While the cake is still warm, poke holes across the top with a skewer and pour over the drizzle. Leave to cool in the tin."}]$$::jsonb,
  ARRAY['baking','dessert','cake']
);