<template>
    <div class="page-home">
        <header-cps></header-cps>
        <dashboard></dashboard>
        <vue-particles class="home-particles" color="#dedede" :particleOpacity="0.7" :particlesNumber="80" shapeType="circle" :particleSize="4" linesColor="#dedede" :linesWidth="1" :lineLinked="true" :lineOpacity="0.4" :linesDistance="150" :moveSpeed="3" :hoverEffect="true" hoverMode="grab" :clickEffect="true" clickMode="repulse">
        </vue-particles>
    </div>
</template>

<script>
import HeaderCps from "@/components/Header/Header";
import Dashboard from "@/components/Dashboard/Dashboard";
export default {
    name: "Home",
    components: {
        HeaderCps,
        Dashboard
    },
    data() {
        return {};
    }
};
</script>

<style scoped>
.page-home {
    text-align: center;
    color: #fff;
    background: #5a59a0;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    text-align: center;
    height: 100%;
    background-image: radial-gradient(
        50% 158%,
        #57509e 29%,
        #353469 93%,
        #333366 100%
    );
}
.home-particles{
    width: 100%;
    height: 100%;
}
</style>
