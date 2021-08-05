import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  //reindenizar numero de amount por produto dentro do cart 
  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    // cria objeto newSumAmount para serem independentes
    const newSumAmount = {...sumAmount}
    //acessa a propriedade product.id por meio de variavel, acessando id por id e retonando o amount respectivo 
    newSumAmount[product.id] = product.amount;
    return newSumAmount;

  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      // carregamento dos produtos com o preço fomatado
      //chama a api.get() todos os produtos(um [] array de produtos)
      const response = await api.get<Product[]>(`products`);
      //retornar os produtos com o priceFormatted
      //response.map chama api.get() todos os produtos
      const data = response.data.map(product =>({
        // passa os produtos que estã em formato ProductFormatted(ainda sem priceFormatted)
        ...product,
        //cria o compo de priceFormatted e formatando o price
        priceFormatted: formatPrice(product.price)

      }))
      setProducts(data);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    // chamar a função addProducts para ser acionada por id pelo handleAddProduct ao ser clicado
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map(product => (  
      /*interar sobre o carrinho */
        <li key={product.id} /*por conta do map o primeiro elemento tem q ter a key, id */> 
        <img src={product.image} alt={product.title} />
        <strong>{product.title}</strong>
        <span>{product.priceFormatted}</span>
        <button
          type="button"
          data-testid="add-product-button"
          onClick={() => handleAddProduct(product.id)}
        >
          <div data-testid="cart-product-quantity">
            <MdAddShoppingCart size={16} color="#FFF" />
            {cartItemsAmount[product.id] || 0} 
          </div>

          <span>ADICIONAR AO CARRINHO</span>
        </button>
      </li>
      ))}
    </ProductList>
  );
};

export default Home;
