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
    <RoomChat v-else :users="users.value" @send-message="onSendMessage" />
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

    return { username, isLogedIn, users, onConnect, onSubmitLogin };
  },
  components: {
    RoomChat,
  },
  mounted() {
    socket.on("getUsers", (data) => {
      console.log("getUsers...", data);
      data.forEach((user) => {
        user.self = user.userId === socket.id;
      });

      this.users.value = data.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });

      console.log("users..", this.users);
    });

    socket.on("userJustConnected", (data) => {
      this.users.value.push(data);
      console.log("user just connected", this.users.value);
    });

    socket.on("privateMessageToReceiver", () => {});
  },
  methods: {
    onSendMessage($event) {
      socket.emit("privateMessage", $event);
    },
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
