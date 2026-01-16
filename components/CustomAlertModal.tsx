import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const CustomAlertModal: React.FC<Props> = ({
  visible,
  title = "Confirm",
  message = "Are you sure?",
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {cancelText && onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {confirmText && onConfirm && (
              <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#222",
  },
  message: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#555",
    minWidth: 100,
    alignItems: "center",
  },
  confirmBtn: {
    backgroundColor: "#f60",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
