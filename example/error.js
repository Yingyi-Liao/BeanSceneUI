// {orderItems.map(item => 
//   <View>
//     <Text>{item.name}</Text>
//   </View>


{orderItems.map(item => (
  <View key={item.id}>
    <Text>{item.name}</Text>
  </View>
))}


const updateQty = (id, qty) => {
  const item = orderItems.find(i => i.id === id);
  item.qty = qty; 
  setOrderItems([...orderItems]);
};

const updateQty = (id, qty) => {
  if (qty <= 0) {
    removeItem(id);
    return;
  }

  const item = orderItems.find(i => i.id === id);
  item.qty = qty;
  setOrderItems([...orderItems]);
};


useEffect(() => {
  fetch(`${API_BASE}/api/item`)
    .then(res => res.json())
    .then(json => setMenu(json.data)); 
}, []);

useEffect(() => {
  const loadAll = async () => {
    const cachedMenu = await loadMenuFile();
    if (cachedMenu) setMenu(cachedMenu);   //  Offline support

    if (isOnline) {
      const response = await fetch(`${API_BASE}/api/item`);
      const json = await response.json();
      setMenu(json.data);
      saveMenuFile(json.data);             //  Save for offline use
    }
  };

  loadAll();
}, []);

const handlePress = () => {
  console.log("Pressed");
};

document.addEventListener("click", handlePress); 

useEffect(() => {
  const handlePress = () => {
    console.log("Pressed");
  };

  document.addEventListener("click", handlePress);

  return () => document.removeEventListener("click", handlePress);
}, []);