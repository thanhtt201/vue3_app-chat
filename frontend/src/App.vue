<template>
  <div>
    <form action="" @submit.prevent="onSubmitLogin" v-if="!isLogedIn">
      <div class="flex justify-center my-8">
        <input
          type="text"
          class="form-control block px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          id="exampleFormControlInput2"
          placeholder="Tên đăng nhập"
          v-model="username"
        />
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded"
          type="submit"
        >
          Đăng nhập
        </button>
      </div>
    </form>
    <RoomChat
      v-else
      :users="users.value"
      :selected-user-to-send="selectedUserToSend?.value"
      @send-message="onSendMessage"
      @selected-user-to-send="selectedUserToSendEvent"
    />
  </div>
</template>

<script>
import socket from "./plugins/socket";
import { ref } from "vue";
import RoomChat from "./components/room-chat/RoomChat.vue";

export default {
  setup() {
    const username = ref("");
    const isLogedIn = ref(false);
    const users = ref([]);
    const selectedUserToSend = ref({});

    function onConnect() {
      socket.connect();
    }

    function onSubmitLogin() {
      isLogedIn.value = true;
      socket.auth = {
        username: username.value,
      };
      socket.connect();
    }

    return {
      username,
      isLogedIn,
      users,
      selectedUserToSend,
      onConnect,
      onSubmitLogin,
    };
  },
  components: {
    RoomChat,
  },
  mounted() {
    socket.on("getUsers", (data) => {
      data.forEach((user) => {
        user.self = user.userId === socket.id;
      });

      this.users.value = data.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });

    socket.on("userJustConnected", (data) => {
      this.users.value.push(data);
    });

    socket.on("privateMessageToReceiver", ({ message, from }) => {
      const user = this.users.value.find((user) => user.userId === from);
      if (user.userId === from) {
        if (!user.messages) {
          user.messages = [];
        }
        user.messages.push({
          message,
          isSelf: false,
        });
      }
    });
  },
  methods: {
    onSendMessage($event) {
      socket.emit("privateMessage", $event);
      if (!this.selectedUserToSend.value.messages)
        this.selectedUserToSend.value.messages = [];
      this.selectedUserToSend.value.messages.push({
        message: $event.message,
        isSelf: true,
      });
    },
    selectedUserToSendEvent($event) {
      this.selectedUserToSend.value = $event;
    },
  },
  unmounted() {
    socket.off("getUsers");
    socket.off("userJustConnected");
    socket.off("privateMessageToReceiver");
    socket.off("privateMessage");
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
