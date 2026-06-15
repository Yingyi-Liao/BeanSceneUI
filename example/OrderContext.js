import { DoublyLinkedList } from "../example/DoublyLinkedList";

const orderList = new DoublyLinkedList();

export function OrderProvider({ children }) {
  const [orderItems, setOrderItems] = useState([]);

  const addItem = (item, qty = 1) => {
    const existing = orderList.findById(item.id);

    if (existing) {
      existing.value.qty += qty;
    } else {
      orderList.append({ ...item, qty });
    }

    setOrderItems(listToArray());
  };

  const updateQty = (id, qty) => {
    const node = orderList.findById(id);
    if (!node) return;

    node.value.qty = qty;
    setOrderItems(listToArray());
  };

  const removeItem = (id) => {
    const node = orderList.findById(id);
    if (!node) return;

    orderList.remove(node);
    setOrderItems(listToArray());
  };

  const clearOrder = () => {
    orderList.head = null;
    orderList.tail = null;
    orderList.length = 0;
    setOrderItems([]);
  };

  const listToArray = () => {
    const arr = [];
    let curr = orderList.head;
    while (curr) {
      arr.push(curr.value);
      curr = curr.next;
    }
    return arr;
  };

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        addItem,
        updateQty,
        removeItem,
        clearOrder,
        orderList, // ⭐ expose linked list for navigation
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
