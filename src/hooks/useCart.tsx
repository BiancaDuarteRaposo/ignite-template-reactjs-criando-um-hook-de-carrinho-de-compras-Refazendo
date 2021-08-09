import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // Cria um novo array para manter a imutabilidade do cart
      const updatedCart = [...cart];
      //verificar se o produto existente
      const productExists = updatedCart.find(product => product.id === productId);
      //verificar o stock/ "api.get()" serve para chamar a rota 
      const stock = await api.get(`/stock/${productId}`);
      //consulta qtd d produto do stock
      const stockAmount = stock.data.amount;
      //quantidade atual de produto no carrinho/ se o produto existe no carrinho ? passa o amount : se não é  0
      const currentAmount = productExists ? productExists.amount : 0;
      // quantidade desejada ao addproduct/ currentAmount(qtd atual)+1produto
      const amount = currentAmount +1;

      //Verifica se a quantidade desejada é maior que o stock no
      if (amount>stockAmount) {
        // mostra erro
        toast.error('Quantidade solicitada fora de estoque');
        // deve encerrar a função entao damos
        return;
      }
      
      // se o produto exixte dento do cart
      if(productExists){
        //identifica e adiciona +1 na qtd (amount)
        productExists.amount = amount;
      } else{ // se for produto novo
        //buscar o produto na api.get()
        const product = await api.get(`/product/${productId}`);
        // pegar os dados da api e criar um campo amount com o valor de 1, como pr1meira add no cart do produto
        const newproduct = {
          ...product.data,
          amount: 1
        }

        //atualizar o UpdatedCart colocando o newproduct
        updatedCart.push(newproduct);
      }
      //manter as ações setando o carrinho
      setCart(updatedCart)
      //JSON.stringify(updatedCart) transforma o array, q é o carrinho, em string para "combinar" o setItem,que recebe string
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // Cria um novo array para manter a imutabilidade do cart
      const updatedCart = [...cart];
      // procura por findindex de  cada product
      const productIndex = updatedCart.findIndex(product => product.id === productId);
      // se encontrou 
      if (productIndex >=0) { //se não encontra o findIndex retorna -1.
      // pega o [] e deleta o produto, 1 pq é um produto
      updatedCart.splice(productIndex,1);
      //setar o array do carrinho
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else{
        //mostra erro 
        throw Error();
      }

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount, //amount desejado
  }: UpdateProductAmount) => {
    try {
      //verificar se a qtdd do produto for menor = a 0
      if (amount <= 0){
        //sair da função
        return;
      } 

      // verificar estock
      const stock = await api.get(`/stock/${productId}`);
      // chamar stockamout
      const stockAmount = stock.data.amount;
      
      // se a amount for maior que o stockamount 
      if (amount > stockAmount){
        // sái da função retornando error
        toast.error('Quantidade solicitada fora de estoque');
        return;  
      }
      
      //manter e acrescentar ao cart
      const updatedCart =[...cart];
      // procurar por produto manter no cart 
      const productExists = updatedCart.find(product=> product.id === productId);

      // se o produto existe no cart
      if(productExists){
        // acrescenta um na quantidade do produto
        productExists.amount=amount;
        //atualiza o cart
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else {
        // se o produto não exixstit no cart 
        throw Error
      }

    } catch {
    
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
