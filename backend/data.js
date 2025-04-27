import bcrypt from 'bcryptjs';
const data = {
  users: [
    {
      name: 'Filip',
      email: 'admin@example.com',
      password: bcrypt.hashSync('1234'),
      isAdmin: true,
    },
    {
      name: 'Marian',
      email: 'user@example.com',
      password: bcrypt.hashSync('1234', 8),
      isAdmin: false,
    },
  ],
  products: [
    {
      //_id: '1',
      name: 'Mândrie și prejudecată',
      slug: 'mandrie-si-prejudecata',
      category: 'Literatură clasică',
      image: '/images/mandrie_si_prejudecata.jpeg',
      price: 30.0,
      countInStock: 0,
      brand: 'Jane Austen',
      rating: 4.5,
      numReviews: 120,
      description:
        'Un roman clasic despre dragoste, diferențele sociale și prejudecăți.',
    },
    {
      //_id: '2',
      name: '1984',
      slug: '1984',
      category: 'Ficțiune distopică',
      image: '/images/1984.jpeg',
      price: 25.0,
      countInStock: 8,
      brand: 'George Orwell',
      rating: 4.8,
      numReviews: 150,
      description:
        'Un roman care explorează totalitarismul, supravegherea și controlul social.',
    },
    {
      //_id: '3',
      name: 'The Catcher in the Rye',
      slug: 'the-catcher-in-the-rye',
      category: 'Ficțiune modernă',
      image: '/images/the_catcher.jpeg',
      price: 20.0,
      countInStock: 10,
      brand: 'J.D. Salinger',
      rating: 4.2,
      numReviews: 200,
      description:
        'O poveste despre adolescența turbulentă și alienarea socială.',
    },
    {
      //_id: '4',
      name: 'Harry Potter și piatra filosofală',
      slug: 'harry-potter-si-piatra-filosofala',
      category: 'Fantasy',
      image: '/images/Harry_potter.jpeg',
      price: 50.0,
      countInStock: 30,
      brand: 'J.K. Rowling',
      rating: 4.9,
      numReviews: 300,
      description:
        'Primul volum din seria Harry Potter, despre magia și aventurile unui băiat vrăjitor.',
    },
  ],
};

export default data;
