variable "dcm-service" {
  type = "map"
  default = {
	"name" = "dcm-service"
	"persistence-directory" = "/home/drferreira/otus-platform/docker-persistence/db-distribution/database"
	"port" = 54001
  }
}

resource "docker_image" "dcm-service" {
  name = "dcm-service:latest"
}

resource "docker_network" "dcm-network"{
  name = "dcm-network"
}

resource "docker_container" "dcm-service" {
  name = "dcm-service"
  image = "${docker_image.dcm-service.latest}"
  ports {
	internal = 8080
	external = "${var.dcm-service["port"]}"
  }
  networks_advanced {
    name = "${docker_network.dcm-network.name}"
  }
}
