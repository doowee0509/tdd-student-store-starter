import * as React from "react"
import Navbar from "../Navbar/Navbar"
import Sidebar from "../Sidebar/Sidebar"
import Home from "../Home/Home"
import NotFound from "../NotFound/NotFound"
import Orders from "../Orders/Orders"
import ProductDetail from "../ProductDetail/ProductDetail"
import OrderDetail from "../OrderDetail/OrderDetail"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import axios from "axios"
import "./App.css"

export default function App() {
  const [products, setProducts] = React.useState([])
  const [searchInput, setSearchInput] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all categories")
  const [isFetching, setIsFetching] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [checkoutError, setCheckoutError] = React.useState("")
  const [getReceipt, setGetReceipt] = React.useState(false)
  const [order, setOrder] = React.useState({})
  const [postStatus, setPostStatus] = React.useState(false)
  const [shoppingCart, setShoppingCart] = React.useState({}) //objects need itemId and quantity
  const [checkoutForm, setCheckoutForm] = React.useState({
    name: "",
    email: ""
  })

  const shopMore = () =>{
    const offsetTop = document.getElementById("shop").offsetTop;
    setGetReceipt(false);
    setIsOpen(false);
    setPostStatus(false);
    window.scrollTo(0, offsetTop);
  }

  const handleOnToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen)
  }

  const handleOnSearch = (e) => {
    setSearchInput(e.target.value)
  }

  const handleAddItemToCart = (productId) => {
    if (shoppingCart.hasOwnProperty(productId)) {
      setShoppingCart((oldShoppingCart) => ({...oldShoppingCart,[productId]:oldShoppingCart[productId] + 1}))
    }
    else {
      setShoppingCart((oldShoppingCart) => ({...oldShoppingCart, [productId]: 1}))
    }
    setCheckoutError("")  
  }

  const handleRemoveItemFromCart = (productId) => {
    const nextShoppingCart = {...shoppingCart, [productId]:shoppingCart[productId] - 1}
    if (nextShoppingCart[productId] === 0) {
      delete nextShoppingCart[productId]
    }

    setShoppingCart(nextShoppingCart)
    console.log(shoppingCart)
  }

  const handleOnCheckoutFormChange = (name, value) => {
    let newCheckoutForm = {...checkoutForm}
    newCheckoutForm[name] = value
    setCheckoutForm(newCheckoutForm)
    setCheckoutError("")
  }

  const handleOnSubmitCheckoutForm = () => {  
    // axios POST request
    if (Object.keys(shoppingCart).length === 0) {
      setCheckoutError("item")
      return;
    }
    if (checkoutForm.name === "" || checkoutForm.email === "") {
      setCheckoutError("field")
      return;
    }

    let cartArray = []
    for (const item in shoppingCart){
      cartArray.push({itemId: item, quantity: shoppingCart[item]})
    }
    axios.post("http://localhost:3001/store", 
    { 
      user:
      {
        name: checkoutForm.name,
        email: checkoutForm.email
      },
      shoppingCart: cartArray
    })
    .then(res => {
      setShoppingCart({})
      setCheckoutForm({name:"", email:""})
      setGetReceipt(true)
      setPostStatus(true)
      setOrder(res.data.purchase)
    })
  }
  React.useEffect(() => {
    const getProducts = async () => {
      setIsFetching(true)
      try {
        const res = await axios.get("http://localhost:3001/store")
        // const res = await axios.get("https://codepath-store-api.herokuapp.com/store")
        const data = res.data //maybe need to add question mark
        if (data) {
          setProducts(data.products)
          return;
        }
        else {
          setError(new Error("Cannot fetch products."))
        }
      } catch(err) {
        setError(err)
      } finally {
        setIsFetching(false)
      }
    }
    getProducts()

  }, [])

  return (
    <div className="app">
      <BrowserRouter>
        <main>
          <Navbar />
          <Sidebar postStatus={postStatus} setPostStatus={setPostStatus} setIsOpen={setIsOpen}shopMore={shopMore} order={order} getReceipt={getReceipt} setGetReceipt={setGetReceipt}isOpen={isOpen} handleOnToggle={handleOnToggle} shoppingCart={shoppingCart} products={products} checkoutForm={checkoutForm} handleOnCheckoutFormChange={handleOnCheckoutFormChange} handleOnSubmitCheckoutForm={handleOnSubmitCheckoutForm} checkoutError={checkoutError}/>
          <Routes>
            <Route exact path="/" element={ <Home setIsOpen={setIsOpen}products={products} handleAddItemToCart={handleAddItemToCart} handleRemoveItemFromCart={handleRemoveItemFromCart} shoppingCart={shoppingCart} searchInput={searchInput} handleOnSearch={handleOnSearch} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />}/>
            <Route path="/products/:productId" element={<ProductDetail isFetching={isFetching} setIsFetching={setIsFetching} handleAddItemToCart={handleAddItemToCart} handleRemoveItemFromCart={handleRemoveItemFromCart} setError={setError} shoppingCart={shoppingCart}/>}/>
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:purchaseId" element={<OrderDetail isFetching={isFetching} setIsFetching={setIsFetching} setError={setError}/>}/>
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}


