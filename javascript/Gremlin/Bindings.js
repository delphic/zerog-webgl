var Bindings = function() {
	var bindings = {};

	function Bind(parameters) {
		if (!parameters.Name) {
			throw new Error("No binding name provided");
		}
		var binding = GetBinding(parameters.Name);
		if(parameters.PrimaryKey) {
			binding.PrimaryKey = parameters.PrimaryKey;
		}
		if(parameters.SecondaryKey) {
			binding.SecondaryKey = parameters.SecondaryKey;
		}
		if(!binding.hasOwnProperty("Enabled")) {
			binding.Enabled = true;
		}
		bindings[parameters.Name] = binding;
	}

	function Unbind(name) {
		if(bindings.hasOwnProperty(name)) {
			delete bindings[name];
		}
	}

	function GetBinding(name) {
		return (bindings.hasOwnProperty(name)) ? bindings[name] : {};
	}

	function GetAllBindings() {
		return bindings;
	}

	function EnableBinding(name) {
		if (bindings.hasOwnProperty(name)) {
			bindings[name].Enabled = true;
		}
	}

	function DisableBinding(name) {
		if (bindings.hasOwnProperty(name)) {
			bindings[name].Enabled = false;
		}
	}

	return {
		Bind:			Bind,
		Unbind:			Unbind,
		GetBinding:		GetBinding,
		GetAllBindigns:	GetAllBindings,
		EnableBinding:	EnableBinding,
		DisableBinding:	DisableBinding
	}
}();