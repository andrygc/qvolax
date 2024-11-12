<?php
class resize
{
	protected $image;

	public function foto($image)
	{
		$this->image = $image;
	}

	public function create($nombre, $maximo)
	{
		list($width, $height, $type, $attr) = getimagesize($this->image);

		if ($width > $height) {
			if ($width > $maximo) {
				$height = ($maximo / $width) * $height;
				$width = $maximo;
			}
		} else {
			if ($height > $maximo) {
				$width = ($maximo / $height) * $width;
				$height = $maximo;
			}
		}

		$this->create_thumb($nombre, $width, $height);
	}


	public function create_thumb($nombre, $newWidth, $newHeight)
	{

		$pt = explode("\.", $nombre); // explode nombre por "."
		$extension = strtolower($pt[count($pt) - 1]); // extraigo la extencion

		list($width, $height, $type, $attr) = getimagesize($this->image);

		$types = array(1 => 'gif', 2 => 'jpg', 3 => 'png'); // extenciones

		$ext = $types[$type]; // extension del fichero;

		switch ($ext) { // crear imagen 
			case "gif":
				$source = imagecreatefromgif($this->image);
				break;
			case "jpg":
				$source = imagecreatefromjpeg($this->image);
				break;
			case "png":
				$source = imagecreatefrompng($this->image);
				break;
			default:
				$source = imagecreatefromjpeg($this->image);
		}

		$thumb = imagecreatetruecolor($newWidth, $newHeight); // la imagen creada pintarla de blanco

		$tmp_w = ($width / $newWidth); // relacion temporal width 
		$tmp_h = ($height / $newHeight); // relacion temporal height 
		$min = ($tmp_w < $tmp_h) ? $tmp_w : $tmp_h; // menor
		$fw = intval($newWidth * $min); // nueva relacion
		$fh = intval($newHeight * $min);
		$x = intval(($width - $fw) / 2);
		$y = intval(($height - $fh) / 2);

		// resplazar imagen x la subida
		imagecopyresampled($thumb, $source, 0, 0, $x, $y, $newWidth, $newHeight, $fw, $fh);

		// image sharpen 
		$mx = array(array(-1, -1, -1), array(-1, 16, -1), array(-1, -1, -1));
		imageconvolution($thumb, $mx, 8, 0); // sharpen img.

		switch ($extension) { // salvar la imagen en su formato
			case "png":
				imagepng($thumb, $nombre);
				break;
			case "gif":
				imagegif($thumb, $nombre);
				break;
			default:
				imagejpeg($thumb, $nombre, 80);
		}

		// destroy images liberar ram...
		imagedestroy($thumb);
		imagedestroy($source);
	}
}
