import { atom } from 'nanostores';

const cart_data = atom([]);
const cart_number = atom(0);

const addToCart = (s) => {
    s.quantity = 1
    const current_cart = JSON.parse(localStorage.getItem("cart_items"));
    // Check if item already exists in the cart by ID (or another unique property)
    if (!current_cart.some(item => item.uuid === s.uuid)) {
        cart_data.set([...current_cart, s]);
        persistLocalStorage();
    } else {
        // Optional: Handle duplicate item (e.g., show a message)
        console.log('Item already in cart');
    }
};

const updateCart = () => {
    const current_cart = JSON.parse(localStorage.getItem("cart_items"));
    cart_data.set(current_cart);
    cart_number.set(current_cart.length)
};

const persistLocalStorage = () => {
    const current_cart = cart_data.get();
    localStorage.setItem("cart_items", JSON.stringify(current_cart))
    setCartNumber(current_cart.length)
}

const getCartNumber = () =>{
    const current_cart = JSON.parse(localStorage.getItem("cart_items"));
    cart_number.set(current_cart.length)
}

const setCartNumber = (a) =>{
    // const current_cart = cart_data.get();
    // const v = { user: initUser, content: s }
    cart_number.set(a)
}

export { cart_data, cart_number, addToCart, updateCart, getCartNumber, setCartNumber };
