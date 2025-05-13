import { useContext } from "react";
import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { AuthenticatedContext } from "../context/AuthContext";


const Lodingscreen = () => {

    const { isLoading } = useContext(AuthenticatedContext)

  return (
    <Modal
      transparent
      animationType="fade"
      visible={
      isLoading 
      }
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ActivityIndicator size={70} color="#007AFF" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    zIndex: 999999,
  },
  modalContent: {
    width: "80%", // Responsive width
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#555",
  },
});

export default Lodingscreen;
