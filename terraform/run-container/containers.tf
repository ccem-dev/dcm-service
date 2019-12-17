variable "dcm-service-httpport" {
  default = 54001
}

variable "dcm-service-version" {
  default = "latest"
}

variable "dcm-service-dicom-hostname" {
  default = ""
}

variable "dcm-service-dicom-port" {
  default = ""
}

variable "dcm-service-dicom-auth-host" {
  default = ""
}

variable "dcm-service-dicom-auth-port" {
  default = ""
}

variable "dcm-service-dicom-secret" {
  default = ""
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
  env = [
		"DICOM_REQUEST_HOSTNAME=${var.dcm-service-dicom-hostname}", 
		"DICOM_REQUEST_PORT=${var.dcm-service-dicom-port}", 
		"DICOM_AUTHENTICATION_HOST=${var.dcm-service-dicom-auth-host}", 
		"DICOM_AUTHENTICATION_PORT=${var.dcm-service-dicom-auth-port}",
		"DICOM_SECRET=${var.dcm-service-dicom-secret}"
	]
  ports {
	internal = 8080
	external = "${var.dcm-service-httpport}"
  }
  networks_advanced {
    name = "${docker_network.dcm-network.name}"
  }
}
