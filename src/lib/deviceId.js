// Generador y recuperador de ID único de dispositivo / comensal

export const getOrCreateDeviceId = () => {
  let id = localStorage.getItem('acuarela_device_id');
  if (!id) {
    id = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    localStorage.setItem('acuarela_device_id', id);
  }
  return id;
};
