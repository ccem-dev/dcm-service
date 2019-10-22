variable "dcm-service-httpport" {
  default = 54001
}

variable "dcm-service-version" {
  default = "latest"
}

resource "docker_image" "dcm-service" {
  name = "dcm-service:${var.dcm-service-version}"
}

resource "docker_network" "dcm-network"{
  name = "dcm-network"
}

resource "docker_container" "dcm-service" {
  name = "dcm-service"
  image = "${docker_image.dcm-service.name}"
  ports {
	internal = 8080
	external = "${var.dcm-service-httpport}"
  }
  networks_advanced {
    name = "${docker_network.dcm-network.name}"
  }
}
