const { orderList } = useOrder();

const goNext = () => {
  if (orderList.current?.next) {
    orderList.current = orderList.current.next;
    console.log("Next item:", orderList.current.value);
  }
};

const goPrev = () => {
  if (orderList.current?.prev) {
    orderList.current = orderList.current.prev;
    console.log("Previous item:", orderList.current.value);
  }
};

